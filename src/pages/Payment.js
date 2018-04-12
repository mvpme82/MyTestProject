import React, { Component } from 'react';
import {observer} from "mobx-react";
import mobx,{extendObservable, computed} from "mobx";
import Service from '../service';
import { Modal , Button} from 'react-bootstrap';
import ChannelFilter from '../components/ChannelFilter';
import InputNumber from 'rc-input-number';
import objectAssign from 'object-assign';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import utils from '../utils';
// 引入登录弹框功能
import OfflinePay from '../components/OfflinePay';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

var ReactToastr = require("react-toastr");
var {ToastContainer} = ReactToastr; // This is a React Element.
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

let bankUrl = 'http://66aso.kuchuan.com/bankpayment';


export default observer(class Payment extends Component {
  	constructor(props){
		super(props);
  		extendObservable(this,{
			appdetail: {},
			payWay: 1, // 1支付宝 2微信
			schemeDetail: {},
			paying: false, // 正在支付
			schemeBtn: false,
			payError: false,
			showWechatPayModal: false,
			showConfirmModal: false,
			isSuccess: false, //是否支付成功
			orderEntity:{
				keywordInfos: []
			},
			schemeId:'',
			appId: '',
			totalPrice: computed(()=>{
                let totalprice = 0;
                if (this.orderEntity.taskType == 4) {
                    totalprice = this.orderEntity.mechinePrice * this.neededEntity.week / 7;
                }
				else {
					if (!this.isEdit) {
						totalprice = this.orderEntity.fee;
					}
					else {
						this.orderEntity.keywordInfos.forEach((val)=>{
							if (!isNaN(Number(val.buyDownload))) {
								totalprice += Number( Number(val.buyDownload)*Number(val.price) );
							}
						}); 
					} 				
                }
				return totalprice;
			}),
			neededEntity:{
				week: 7
			},
			payPrice: 0,
			isBeforePalance: true,    // 是否使用余额之前状态
			isPalance: true,    // 是否使用余额
			palancePrice: 0,    // 余额数
			usePalancePrice: 0, // 使用余额数
			isMachine: false,   // 是否为机刷，判断url里面的tasktype, 为4 的时候，是机刷
			initLoading: true,
			deleteLoading: false,  // 是否删除刷新
			baseModalShow: false,
			addKeyWordFlag: false,  // 是否添加关键词
			isUpdateKeyWordFlag: false, // 是否为更新关键词

			isEdit: true, 				// 订单是否可以编辑
			isBetter: computed(()=>{
				// 是否有清空的功能
				let betterNum = 0;
				this.orderEntity.keywordInfos.forEach((val)=>{
					if (this.isMachine) {
						if (val.initRank == '-') {
							betterNum++;
						}
					}
					if (val.initRank > 200 || val.initRank == '-') {
						betterNum++;
					}
				}); 
				return betterNum;
			})
  		});
  		this.isSchemePay = this.props.type === 'schemepay';
		if (this.isSchemePay) {
			let ids = this.props.match.params.schemeId.split('-');
			if (ids.length >= 2) {
				this.schemeId = ids[0];
				this.appId = ids[1];
			}
			else {
				this.schemeId = ids[0];
			}
			this.loadSchemeInfo(this.schemeId);  
			if (this.props.location.buyAgain || this.props.match.params.tradeNo > 0) {
				this.tradeNo = this.props.match.params.tradeNo;		
			}
			else {
				this.createScheme();
			}	
		}
		else {
			// 将keyword转义
			objectAssign(this.neededEntity, this.props.match.params);
			this.loadAppInfo(this.props.match.params.appId);
			this.tradeNo = this.props.match.params.tradeNo;
			if (this.props.location.buyAgain || this.props.match.params.tradeNo > 0) {
				this.today = moment();
				this.initTime();
				if (this.props.location.buyAgain) {
					this.orderEntity = this.props.location.orderdetail;
					this.isMachine = this.orderEntity.taskType == '4';
					this.isEdit = this.orderEntity.isEdit;
				}
				else {
					this.loadOptimizeInfo(this.tradeNo);
				}
				this.initLoading = false;
			}				
		}
		this.loadMyAssets();
	}
	initTime() {
        let hh = parseInt(this.today.format('HH'));
        let mm = parseInt(this.today.format('mm'));

        if (hh >= 21) {
            this.today = moment(this.today).add(1,'day');
        }
        else if (hh < 9) {
            this.today = moment({hour:10,minute:0});
        }
        else if(hh == 20) {
            this.today = moment({hour:hh, minute: mm+1});
        }
        else {
            this.today = moment({hour:hh+1, minute:0})
		}
		this.neededEntity.optimizeDatetime = this.today.format('YYYY-MM-DD HH:mm:ss');
    }
  	render() {
    	return (
     		<div className="aso-payment">
     			<section className="aso-container">
					{
						this.props.type !== 'schemepay' && (
							<div className="clearfix aso-commonheading">
								<div className="pull-left">
									<img className="aso-normal-icon" src={this.appdetail.icon}/>
									<dl className="pull-right">
										<dt className="aso-commonheading__title">{this.appdetail.title}</dt>
										<dd className="clearfix">
											<dl className="pull-left">
												<dt className="aso-commonheading__subtitle">分类</dt>
												<dd className="aso-commonheading__text">{this.appdetail.categoryName}</dd>
											</dl>
											<dl className="pull-left">
												<dt className="aso-commonheading__subtitle">APP ID</dt>
												<dd className="aso-commonheading__text">{this.appdetail.appId}</dd>
											</dl>
											<dl className="pull-left">
												<dt className="aso-commonheading__subtitle">开发商</dt>
												<dd className="aso-commonheading__text">{this.appdetail.developerName}</dd>
											</dl>
										</dd>
									</dl>
								</div>
							</div>
						)
					}
	      			<div className={"pay-body " + (this.props.type != 'schemepay' && "pay-body-pptimize")}>
						<div className="pay-info">
							{
								this.props.type === 'schemepay' ? this.renderSchemePayInfo() : (
									this.isMachine? this.renderMechinePayInfo() : this.renderOptimizePayInfo()
								)
							}
						</div>
						<div className="pay-method">
							<div className="pay-way">
								<dt>支付方式 :</dt>
								<dd onClick={this.changePayType.bind(this, 1)} className={this.payWay === 1 && "active"}><img height="32" src={require('../images/alipay-min.png')}/></dd>
								<dd onClick={this.changePayType.bind(this, 2)}  className={this.payWay === 2 && "active"}><img height="32" src={require('../images/weixinpay-min.png')}/></dd>
								<dd onClick={this.changePayType.bind(this, 6)}  className={this.payWay === 6 && "active"}><img height="32" src={require('../images/bank-min.png')}/></dd>
								<dd onClick={this.changePayType.bind(this, 7)}  className={this.payWay === 7 && "active"}><img height="32" src={require('../images/offline-min.png')}/></dd>
							</div>
							<div className="pay-way pay-way-palance col-filter"  disabled={this.payWay === 7}>
								<input type="checkbox" disabled={this.payWay === 7} checked={this.isPalance} onChange={this.showPalance.bind(this)}/> 使用余额（账户当前余额： ￥{this.palancePrice.toFixed(2)}）
							</div>
							<div className="pay-detail">
								<div className="pay-detail-main">
									<p>
										<label>
											总价
										</label>
										<em></em>
										￥ {this.isSchemePay ? this.schemeDetail.schemePrice && this.schemeDetail.schemePrice.toFixed(2) : this.totalPrice.toFixed(2)}
									</p>
									<p>
										<label>
											使用余额
										</label>
										<em>-</em>
										￥ {
												this.isPalance ? this.showPriceUser() : '0.00'
											}
									</p>
								</div>
							</div>
							<dl className="pay-money">
								<dt>应付金额 :</dt>
								{
									this.isPalance ? this.showPrice(1) : this.showPrice(0)
								}
							</dl>
							{
								this.isSchemePay ? (<Button onClick={this.toPayScheme.bind(this)} disabled={this.paying || this.schemeBtn} bsClass="btn" bsStyle="primary" className="aso-style pay-btn fixed-width-btn fixed-width-btn-p">创建订单并支付</Button>) : 
								<Button onClick={this.toPayOptimize.bind(this)} disabled={this.paying || !this.totalPrice} bsClass="btn" bsStyle="primary" className="aso-style pay-btn fixed-width-btn fixed-width-btn-p">创建订单并支付</Button>
							}	
						</div>
     				</div>
     			</section>
	        	<ToastContainer ref="container"
	                        	toastMessageFactory={ToastMessageFactory}
	                        	className="toast-top-right" />
				<Modal show={this.showWechatPayModal}>
					<Modal.Body>
						<div className="text-center">
							<img src={this.wechatPayImage}/>
						</div>
						<div className="text-center">请使用微信扫码充值</div>
					</Modal.Body>
					<Modal.Footer>
						<Button className="aso-style" onClick={this.confirmPayStatus.bind(this)} bsStyle="primary">支付完成</Button>
						<Button onClick={this.confirmPayStatus.bind(this)}>遇到了问题</Button>
					</Modal.Footer>
				</Modal>
				<Modal show={this.showConfirmModal}>
					<Modal.Body>
						<h4>是否完成了购买？</h4>
						<p>请在打开的页面中完成充值，充值完成后，请根据充值的结果点击下面的按钮</p>
					</Modal.Body>
					<Modal.Footer>
						<Button className="aso-style" onClick={this.confirmPayStatus.bind(this)} bsStyle="primary">支付完成</Button>
						<Button onClick={this.confirmPayStatus.bind(this)}>遇到了问题</Button>
					</Modal.Footer>
				</Modal>
				<OfflinePay  orderNo = {this.tradeNo} hide={()=>{ this.baseModalShow = false; }}  showModal = {this.baseModalShow} onChange={(data)=>{
                    console.log(data);
                }}/>
			</div>
    	);
  	}

	// 方案购买
	renderSchemePayInfo(){
  		return (
			<table className="aso-pay-table">
				<thead>
					<tr>
						<td>方案</td>
						<td>词量</td>
						<td>执行价</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td> <img src={this.schemeDetail.icon} className="appicon" /></td>
						<td>{this.schemeDetail.keywordCount}词</td>
						<td>{this.schemeDetail.totalPrice && (this.schemeDetail.totalPrice / 10000).toFixed(1)}万</td>
					</tr>	
				</tbody>
			</table>
  		);
  	}

  	// 关键词优化购买
  	renderOptimizePayInfo(){
		return (
			<div>
				{
					this.neededEntity && this.orderEntity && (
						<div className="pay-channel-filter pay-channel-filter-new">
							<ChannelFilter  timeText="开始执行时间" 
											isEdit={this.isEdit}
											order={this.orderEntity} 
											initDate={this.neededEntity.optimizeDatetime} 
											initRank=	{this.neededEntity.expectRank} 
											onChange={(data)=>{
												this.neededEntity.optimizeDatetime = data.date;
												if (this.neededEntity.expectRank !== data.rank) {
													this.loadSuggestDownload(data.rank);
												}
												this.neededEntity.expectRank = data.rank;
										}}
										
						/>
						{this.isBetter > 0 && this.isEdit && (
							<Button  bsClass="btn" bsStyle="primary" className="aso-style clean-btn"  onClick={this.deleteUselessKeyword.bind(this)}>清除无效关键词</Button>
						)}
					</div>
					)
				}
				<div className="aso-thead">
					<div  className={"aso-row aso-thead-wrap aso-col-6 " + (this.isEdit && " aso-col-7")}>	
						<div className="text-center">
							关键词
						</div>
						<div className="text-center">
							热度
						</div>
						<div className="text-center">
							当前排名
						</div>
						<div className="text-center">
							建议量
						</div>
						<div className="text-center">
							购买量
						</div>
						<div className="text-center">
							单价(元)
						</div>
						{this.isEdit && (
							<div className="text-center">
								操作
							</div>
						)}
					</div>
				</div>
				{!this.initLoading && this.orderEntity.keywordInfos && this.orderEntity.keywordInfos.map((val, index)=>{
					return (
						<div key={index} className={"aso-row aso-col-6 optimize-keyword-row " + (this.isEdit && " aso-col-7")}>	
							{val.isAdd && (
								<div>
									<form className="add-keys-form"  onSubmit={this.addKeyInfo.bind(this, index)}>
										<input autoFocus={true} ref="addkeyword" defaultValue={val.keyword} onBlur={this.addKeyInfo.bind(this, index)} placeholder="输入关键词"/>
									</form>
								</div>
							)}
							{!val.isAdd && (
								<div style={{color: (val.initRank > 200 || val.initRank == '-') && '#ff2b45'}} title={val.keyword}>{val.keyword}</div>
							)}
							<div>{val.initHot}</div>
							<div title={val.initRank == '-'? '未覆盖': val.initRank}>{val.initRank}</div>
							<div>{val.suggestDownload}</div>
							<div>
								<InputNumber 
									precision={0} 
									min={0} 
									disabled={(val.initRank > 200 || val.initRank == '-' || !this.isEdit)}
									formatter={(input)=> {
										if (!/^[0-9]{1,}$/.test(input)) {
											return 0;
										}
										return input;
									}}
									value={val.buyDownload} 
									onChange={(value)=>{ val.buyDownload = value; }}/>
							</div>
							<div>{val.price}</div>
							{this.isEdit  && (
								<div><span title="删除" disabled={this.deleteLoading || val.isAdd} onClick={this.deleteKeyword.bind(this, val.id, index, val.isAdd)} className="aso-icon-delete">X</span></div>
							)}
						</div>						
					)
				})}
				<Loading show={this.initLoading}/>
				<NoData show={!this.initLoading && !this.orderEntity.keywordInfos.length}/>
				{this.isEdit && (
					<div disabled={this.addKeyWordFlag} className="add-keysword">
						<div style={{display: 'inline-block'}} onClick={this.addKeyword.bind(this, -1)}>
							<em></em>添加关键词
						</div>
					</div>
				)}
				{this.isBetter > 0 && this.isEdit && (
					<div style={{color: '#999', fontSize: 12, padding: 13,textAlign: 'center'}}>
							<span>*没有排名或者排名低于200的关键词，无法进行优化。</span>
							<a style={{color: '#9f6cf5', marginLeft: 10, cursor: 'pointer'}} onClick={this.deleteUselessKeyword.bind(this)}>清除无效关键词</a>
					</div>
				)}
			</div>
		)
  	}

	// 机刷购买
	renderMechinePayInfo(){
		return (
			<div>
				{
					this.neededEntity && this.orderEntity && (
						<div className="pay-channel-filter pay-channel-filter-new">
							<ChannelFilter 	timeText="开始执行时间" 
											layout="week"	
											taskType = {this.neededEntity.taskType} 
											isEdit={this.isEdit}
											week = {this.neededEntity.week} 
											order={this.orderEntity}
											initDate={this.neededEntity.optimizeDatetime} 
											initRank={this.neededEntity.expectRank} 
											onChange={(data)=>{
												this.neededEntity.week = data.week;
												this.neededEntity.optimizeDatetime = data.date;
												if (this.neededEntity.expectRank !== data.rank) {
													this.loadMechinePrice(data.rank);
												}
												this.neededEntity.expectRank = data.rank;
											}}
							/>	
							{this.isBetter > 0 && this.isEdit && (
								<Button  bsClass="btn" bsStyle="primary"   className="aso-style clean-btn"  onClick={this.deleteUselessKeyword.bind(this)}>清除无效关键词</Button>	
							)}	
						</div>
					)
				}
				<div className="aso-thead">
					<div  className={"aso-row aso-thead-wrap aso-col-3 " + (this.isEdit && " aso-col-4")}>	
						<div className="text-center">
							关键词
						</div>
						<div className="text-center">
							热度
						</div>
						<div className="text-center">
							当前排名
						</div>
						{this.isEdit && (
							<div className="text-center">
								操作
							</div>
						)}
					</div>
				</div>
				{!this.initLoading && this.orderEntity.keywordInfos && this.orderEntity.keywordInfos.map((val, index)=>{
					return (
						<div key={index} className={"aso-row aso-col-3 optimize-keyword-row  "+ (this.isEdit && " aso-col-4")}>	
							{val.isAdd && (
								<div>
									<form className="add-keys-form"  onSubmit={this.addKeyInfo.bind(this, index)}>
										<input  autoFocus={true} defaultValue={val.keyword} ref="addkeyword" onBlur={this.addKeyInfo.bind(this, index)} placeholder="输入关键词"/>
									</form>
								</div>
							)}
							{!val.isAdd && (
								<div style={{color: val.initRank == '-' && '#ff2b45'}} title={val.keyword}>{val.keyword}</div>
							)}
							<div>{val.initHot}</div>
							<div title={val.initRank == '-'? '未覆盖': val.initRank}>{val.initRank}</div>
							{this.isEdit && (
								<div><span title="删除"   onClick={this.deleteKeyword.bind(this,val.id,index)}  disabled={this.deleteLoading || val.isAdd} className="aso-icon-delete">X</span></div>
							)}
						</div>						
					)
				})}
				<Loading show={this.initLoading}/>
				<NoData show={!this.initLoading && !this.orderEntity.keywordInfos.length}/>
				{this.isEdit && (
					<div disabled={this.addKeyWordFlag} className="add-keysword">
						<div style={{display: 'inline-block'}} onClick={this.addKeyword.bind(this, -1)}>
							<em></em>添加关键词
						</div>
					</div>
				)}
				{this.isBetter > 0 && this.isEdit && (
					<div style={{color: '#999', fontSize: 12, padding: 13,textAlign: 'center'}}>
						<span>*没有排名的关键词无法进行优化。</span>
						<a style={{color: '#9f6cf5', marginLeft: 10, cursor: 'pointer'}} onClick={this.deleteUselessKeyword.bind(this)}>清除无效关键词</a>
					</div>
				)}
			</div>
		)
  	}
	
	changePayType(type) {
		this.payWay = type;
		if (type == 7) {
			this.isBeforePalance = this.isPalance;
			this.isPalance = false;
			this.baseModalShow = true;
		}
		else {
			this.isPalance = this.isBeforePalance;
		}
	}
  	showPalance(){
		this.isPalance = !this.isPalance;
	}
	showPriceUser() {
		var price = this.isSchemePay ? this.schemeDetail.schemePrice && this.schemeDetail.schemePrice.toFixed(2) : this.totalPrice.toFixed(2);
		price = Math.min(this.palancePrice, price);
		return price.toFixed(2);
	}
	// 获取总价格
    showPrice(type) {
		var price = this.isSchemePay ? this.schemeDetail.schemePrice && this.schemeDetail.schemePrice.toFixed(2) : this.totalPrice.toFixed(2);
		if(type) {
			price = price > this.palancePrice ? price - this.palancePrice : 0;
		}
		price = parseFloat(price) || 0;
		return (
			<dd>
				<span>{price.toFixed(2)}</span>
				<span>元</span>
			</dd>
		);
  	}
  	deleteUselessKeyword(){
		var res = [],
			tmp = [];
		this.initLoading = true;
		this.orderEntity.keywordInfos.map((val, index) => {
			if (val.initRank == '-' || (parseInt(val.initRank) > 200 && this.neededEntity.taskType != 4)){
				res.push(val.id);
			}
			else {
				tmp.push(val);
			}
		});
		if (res.length){
			var ids = res.join(',');
			Service.batchDelKeyword(ids).then((res) => {
				if (res.data.status === 200){
					this.orderEntity.keywordInfos = tmp;
					if (this.neededEntity.taskType == 4) {
						this.loadMechinePrice(this.neededEntity.expectRank);
					}
				}
				this.initLoading = false;
			}).catch(()=>{
				this.initLoading = false;
			})
		}
		else {
			this.initLoading = false;
		}
		setTimeout(() => {
			this.addKeyWordFlag = false;
		}, 10);
  	}
	addKeyword(index) {
		if (this.addKeyWordFlag || this.initLoading) {
			return;
		}
		this.addKeyWordFlag = true;
		if (index >= 0) {
			this.isUpdateKeyWordFlag = true;
			this.orderEntity.keywordInfos[index].isAdd = true;
		}
		else {
			this.isUpdateKeyWordFlag = false;
			this.orderEntity.keywordInfos.push({
				isAdd: true,
				appId: this.neededEntity.appId,
				buyDownload: 0,
				download:0,
				expectRank: this.neededEntity.expectRank,
				id: -1,
				initHot: 0,
				initRank: "",
				keyword: "",
				price : 0,
				suggestDownload:0,
				title: this.appdetail.developerName
			});
		}
		
	}
	addKeyInfo(index, evt) {
		evt.preventDefault();
		let kw = this.refs.addkeyword.value.trim();
        if (kw.length) {
			let str = kw.split(/[,，、；;\r\n]/g);
			if (str.length > 1) {
				this.refs.container.warning("", "关键词不能包含逗号、分号、顿号、换行(全角或半角)等符号", {
					timeOut: 3000,
					extendedTimeOut: 0,
					showAnimation: 'animated fadeInDown',
					hideAnimation: 'animated fadeOutUp',
				});
			}
			else {
				let params = this.isUpdateKeyWordFlag ? {
					tradeNo: this.orderEntity.tradeNo,
					keyword: kw,
					expectRank: this.neededEntity.expectRank,
					id: this.orderEntity.keywordInfos[index].id
				}: {
					tradeNo: this.orderEntity.tradeNo,
					keyword: kw,
					expectRank: this.neededEntity.expectRank
				};
				Service.addKeyword(params, this.isUpdateKeyWordFlag).then((res) => {
					if (res.data.status === 200 && res.data.data) {
						let keyData = res.data.data;
						this.refs.container.success("", this.isUpdateKeyWordFlag ? "关键词修改成功": "关键词添加成功", {
							timeOut: 3000,
							extendedTimeOut: 0,
							showAnimation: 'animated fadeInDown',
							hideAnimation: 'animated fadeOutUp',
						});

						this.orderEntity.keywordInfos[index] = {
							buyDownload: keyData.suggest_download,
							suggestDownload: keyData.suggest_download,
							initHot: keyData.init_hot,
							initRank: keyData.init_rank > 0 ? keyData.init_rank : '-',
							price: keyData.price,
							keyword: kw,
							isAdd: false,
							id: keyData.id
						};
						if (this.neededEntity.taskType == 4) {
							this.loadMechinePrice(this.neededEntity.expectRank);
						}		
					}
					else {
						this.orderEntity.keywordInfos[index].isAdd = false;
						this.refs.container.error("", res.data.msg || "关键词操作失败", {
							timeOut: 3000,
							extendedTimeOut: 0,
							showAnimation: 'animated fadeInDown',
							hideAnimation: 'animated fadeOutUp',
						});

						this.orderEntity.keywordInfos.pop();	
					}
					this.addKeyWordFlag = false;
				});
			}
		} 
		else {
			// this.refs.container.warning("", "关键词不能为空", {
			// 	timeOut: 3000,
			// 	extendedTimeOut: 0,
			// 	showAnimation: 'animated fadeInDown',
			// 	hideAnimation: 'animated fadeOutUp',
			// });
			if (this.orderEntity.keywordInfos[index].id) {
				this.deleteKeyword(this.orderEntity.keywordInfos[index].id, index);
			}
			this.orderEntity.keywordInfos.splice(index, 1);	
			this.addKeyWordFlag = false;

		}
	}
	deleteKeyword(id, index, isadd){
		if (this.deleteLoading) {
			return;
		}
		this.deleteLoading = true;
		Service.deleteOptimizeKeyword(id).then((res)=>{
			if (res.data.status === 200) {
				this.orderEntity.keywordInfos.splice(index,1);
				this.addKeyWordFlag = isadd ? false : this.addKeyWordFlag;
				if (this.neededEntity.taskType == 4) {
					this.loadMechinePrice(this.neededEntity.expectRank);
				}
				else {
					this.deleteLoading = false;
				}
			}
			else {
				this.deleteLoading = false;
			}
		}).catch(()=>{
			this.deleteLoading = false;
		})
	}

	createScheme(){
		Service.createSchemeOrder(this.schemeId, this.appId, this.isPalance).then((res)=>{
			if (res.data.status === 200 && res.data.data) {
				this.tradeNo = res.data.data.tradeNo;
			}
			else {
				this.schemeBtn = true;
				this.refs.container.error("", res.data.msg || "创建订单失败", {
					timeOut: 3000,
					extendedTimeOut: 0,
					showAnimation: 'animated fadeInDown',
					hideAnimation: 'animated fadeOutUp',
				});
			}
			this.initLoading = false;
		});
	}

	createOptimize(data, tradeNo){
		if (tradeNo) {
			data['oldTradeNo'] = tradeNo;
		}
		Service.createOptimize(data).then((res)=>{
			if (res.data.status === 200 && res.data.data) {
				this.orderEntity = res.data.data;
				this.tradeNo = this.orderEntity.tradeNo;
				this.initLoading = false;
			}
		});
	}

  	/**
	 * aso方案支付
	 * 
	 */
	toPayScheme(){
		if (this.payWay !== 7) {
			this.paying = true;
			if (!utils.isIos()) {
				this.newWindow = window.open("about:blank",'_blank');
				if (this.payWay != 6) {
					this.newWindow.document.title = "创建订单";
					this.newWindow.document.body.innerHTML = '<img src="http://cdn.coolguang.com/public/66aso/images/loading.gif" style="margin:120px auto;display:block;height:230px;"/>';
				}
			}
		}
		this.toPaySchemeSecond();
	}
	toPaySchemeSecond() {	
		Service.paySchemeOrder(this.tradeNo, this.payWay, this.isPalance).then((response)=>{
			if (response.data.status === 200 && response.data.url) {
				this.toResult(response.data, this.tradeNo);
			}
			else {
				this.showWechatPayModal = false;
				this.showConfirmModal = false;
				(this.payWay !== 7 && !utils.isIos()) && this.newWindow.close();
				this.refs.container.error("", response.data.msg || "支付失败", {
					timeOut: 3000,
					extendedTimeOut: 0,
					showAnimation: 'animated fadeInDown',
					hideAnimation: 'animated fadeOutUp',
				});
			}
			this.paying = false;
		}).catch(()=>{
			this.paying = false;
			(this.payWay !== 7 && !utils.isIos()) && this.newWindow.close();
		});
	} 

	toPayOptimize(){	
		if (this.payWay !== 7) {
			this.paying = true;
			if (!utils.isIos()) {
				this.newWindow = window.open("about:blank",'_blank');
				if (this.payWay != 6) {
					this.newWindow.document.title = "创建订单";
					this.newWindow.document.body.innerHTML = '<img src="http://cdn.coolguang.com/public/66aso/images/loading.gif" style="margin:120px auto;display:block;height:230px;"/>';
				}
			}
		}
		let params = {
			tradeNo: this.orderEntity.tradeNo,
			data: JSON.stringify(mobx.toJS(this.orderEntity.keywordInfos)),
			optimizeDatetime: this.neededEntity.optimizeDatetime,
			expectRank: this.neededEntity.expectRank,
			payType: this.payWay,
			useAssets: this.isPalance
		}
		if (+this.neededEntity.taskType === 4) {
			params.brushDays = this.neededEntity.week;
		}
		else {
			delete params.brushDays;
		}
		Service.payOptimizeOrder(params).then((response)=>{
			if (response.data.status === 200 && response.data.url) {
				this.toResult(response.data, this.orderEntity.tradeNo);
			}
			else {
				this.showWechatPayModal = false;
				this.showConfirmModal = false;
				(this.payWay !== 7 && !utils.isIos()) && this.newWindow.close();
				this.refs.container.error("", response.data.msg || "支付失败", {
					timeOut: 3000,
					extendedTimeOut: 0,
					showAnimation: 'animated fadeInDown',
					hideAnimation: 'animated fadeOutUp',
				});
			}
			this.paying = false;
		}).catch(()=>{
			this.paying = false;
			this.showWechatPayModal = false;
			this.showConfirmModal = false;
			(this.payWay !== 7 && !utils.isIos()) && this.newWindow.close();
		});
	}

	toResult(res, tno) {
		switch(this.payWay) {
			case 7:
				this.baseModalShow = true;
			break;
			case 1:
				if (!utils.isIos()) {
					this.newWindow.location.href = res.url;
				}
				else {
					window.location.href = res.url;
				}
				this.showConfirmModal = true;
			break;
			case 6:
				if (!utils.isIos()) {
					this.newWindow.location.href = bankUrl + '?url=' + encodeURIComponent(res.url);
				}
				else {
					window.location.href = bankUrl + '?url=' + encodeURIComponent(res.url);
				}
				this.showConfirmModal = true;
			break;
			default:
				// 余额足够
				if (res.hasPay) {
					var url = window.location.origin+'/successPay?schemeId='+ res.schemeId +'&appId='+ res.appId+'&money=' + res.fee + '&orderType=' + res.orderType;
					if (!utils.isIos()) {
						this.newWindow.location.href = url;
					}
					else {
						window.location.href = url;
					}
				}
				else {
					this.toWxPay(tno);
					this.showConfirmModal = true;
				}	
			break;
		}
	}
	toWxPay(tradeNo){
		let tradeType = this.isSchemePay ? 'scheme' : 'optimize';
		let url =  `${window.location.origin}/wxpay/${tradeType}/${tradeNo}/${this.isPalance ? 1 : 0}`;
		if (!utils.isIos()) {
			this.newWindow.location.href = url;
		}
		else {
			window.location.href = url;
		}
	}


	confirmPayStatus(){
		this.checkIsPay().then(()=>{
			// window.opener && window.opener.location.reload();
			this.showWechatPayModal = false;
			this.showConfirmModal = false;
			if (this.appId) {
				this.props.history.push(this.isSchemePay ? '/appdetail/'+this.appId : '/dashboard/orders');
			}
			else{
				this.props.history.push(this.isSchemePay ? '/dashboard/schemes' : '/dashboard/orders');
			}
		}).catch(()=>{
			this.showWechatPayModal = false;
			this.showConfirmModal = false;
			this.refs.container.warning("", "支付失败", {
				timeOut: 2000,
				extendedTimeOut: 0,
				showAnimation: 'animated fadeInDown',
				hideAnimation: 'animated fadeOutUp',
			});

			// 重新更新订单
			if (!this.isSchemePay) {
				this.loadOptimizeInfo(this.tradeNo);
			}
			// if (!this.isSchemePay && this.payWay === 2) { // 关键词购买并且是微信支付失败后 更新订单
			// 	this.createOptimize(this.neededEntity, this.tradeNo);
			// }

		});
	}
	/**
	 * 获取余额
	 * 
	 */
	loadMyAssets(){
        Service.getMyAssets({}).then((res)=>{
            if (res.data.status === 200 && res.data.data) {
                this.palancePrice = Math.max(res.data.data.amount, 0) || 0;
            }
        });
    }

  	// 轮询是否支付
	// pollIsPay(){
	// 	this.checkIsPay().then(()=>{
	// 		this.props.history.replace('/dashboard/' + ( this.isSchemePay ? 'schemes' : 'orders') );
	// 	}).catch(()=>{
	// 		setTimeout(this.pollIsPay.bind(this), POLL_T);
	// 	});
	// }


	checkIsPay(){
		return new Promise((resolve, reject)=>{
			Service.checkIsPay(this.tradeNo, this.isSchemePay ? 'scheme' : 'optimize').then((res)=>{
				if (res.data.status === 200) {
					resolve();
				} else {
					reject();
				}
			}).catch(()=>{
				reject();
			})
		});
	}
	loadMechinePrice(rank){
        var res = [];
        let that = this;
		this.orderEntity.keywordInfos.map((val, index) => {
			val.expectRank = rank;
			res.push(val.keyword);
		});
		Service.mechinePrice({
			appId: this.neededEntity.appId,
			channelId: this.neededEntity.channelId,
			keywords: res.join(','),
			expectRank: rank 
		}).then((res)=>{
			if (res.data.status === 200) {
                this.orderEntity.mechinePrice = res.data.data;
            }
			this.deleteLoading = false;
		}).catch(()=>{
			this.deleteLoading = false;
		});
	}

	loadSuggestDownload(rank){
		this.orderEntity.keywordInfos.forEach((info)=>{
			Service.getSuggestDownload({
				appId: this.neededEntity.appId,
				channelId: this.neededEntity.channelId,
				keyword: info.keyword,
				expectRank:rank 
			}).then((res)=>{
				if (res.data.status === 200) {
					info.suggestDownload = res.data.data;
					info.buyDownload = res.data.data;
				}
			})
		});
	}

	loadSchemeInfo(schemeId){
		Service.getScheme(schemeId).then((response)=>{
			if (response.data.status === 200) {
				this.schemeDetail = response.data.data;
			}
		})
	}

	loadAppInfo(appId){
		Service.getAppInfo(appId).then((res)=>{
			if (res.data.status === 200 && res.data.data) {
				this.appdetail = res.data.data;
			}
		});
	}

	loadOptimizeInfo(tNo) {
		Service.getOrderInfo({
			tradeNo: tNo
		}).then((res)=>{
			if (res.data.status === 200 && res.data.data) {
				this.orderEntity = res.data.data;
				this.isMachine = this.orderEntity.taskType == '4';
				this.isEdit = this.orderEntity.isEdit;
			}
		});
	}
});