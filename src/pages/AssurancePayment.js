import React, { Component } from 'react';
import {observer} from "mobx-react";
import mobx,{extendObservable, computed} from "mobx";
import { Modal , Button} from 'react-bootstrap';
import Service from '../service';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import auth from '../auth';
import utils from '../utils';
import config from '../config';
import Clipboard from 'clipboard';
var ReactToastr = require("react-toastr");
var {ToastContainer} = ReactToastr;
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);
const bankUrl = 'http://66aso.kuchuan.com/bankpayment';

const phoneValidate = /^1[3|4|5|7|8][0-9]{9}$/; //手机号正则
const emailValidate =  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; //邮箱正则
var qrCodeUrl = config.HOST + config.QR_IMG + '?content=';

//初始化剪切板
var clipboard = new Clipboard('.clipboard-copy');
export default observer(class AssurancePayment extends Component {
	constructor(props){
		super(props);
		extendObservable(this,{
            initLoading: false,
            payWay:1,
            price: 100,
            assuranceDetail: {},
            showConfirmModal: false,
            informAccount: '',
            isSchemeInfo: false,
            createOrderLink: `${window.location.origin}/assurance/pay/${this.props.match.params.tradeNo}/${this.props.match.params.encryptionStr}`
        });
        this.isSchemeInfo = this.props.type === 'info';
        this.loadAssuranceInfo();       
    }
    componentDidMount(){
        clipboard.on('success', e => {
            this.refs.container && this.refs.container.success("", "链接已复制", {
                timeOut: 3000,
                extendedTimeOut: 0,
                showAnimation: 'animated fadeInDown',
                hideAnimation: 'animat ed fadeOutUp',
            });
        });
    }
	render() {
		return (
			<div className="aso-payment">
     			<section className="aso-container">
                    <div className="pay-body">
                        <div className="pay-assurance-label">
                            <div className="pay-assurance-label-item">
                                <span>订单：{this.assuranceDetail.tradeNo}</span>
                                {this.isSchemeInfo && (
                                    <span>{['待支付', '支付成功', '执行订单', '确认订单', '交易完成'][this.assuranceDetail.orderStatus]}</span>
                                )}
                            </div>
                            <div className="pay-assurance-label-item aso-bottom">
                                {this.isSchemeInfo ? (
                                    <span>应付金额：{parseFloat(this.assuranceDetail.fee).toFixed(2) || 0.00}元</span>
                                ) : (
                                    <span>订单状态：{['待支付', '支付成功', '执行订单', '确认订单', '交易完成'][this.assuranceDetail.orderStatus]}</span>
                                )}
                            </div>
                            <div className="pay-assurance-label-item">
                                <span className="product aso-trancate" title={this.assuranceDetail.title}>应用：{this.assuranceDetail.title}</span>
                                <span>服务类型：{['快速安装任务', '排重安装任务', '激活任务', '注册任务', '保排名任务'][this.assuranceDetail.channelType]}</span>
                                <span>目前排名：TOP{this.assuranceDetail.expectRank}</span>
                                <span>排期时间：{this.assuranceDetail.startTime} 至 {this.assuranceDetail.endTime}</span>
                            </div>

                            {this.isSchemeInfo && (
                                <div className="qrCode-wrap">
                                    <img  src={qrCodeUrl + this.createOrderLink} alt="发给客户付款"/>
                                    <p className="txt-1">发给客户付款</p>
                                </div>
                            )}
                        </div>
                        <div className="aso-thead">
                            <div  className={"aso-row aso-thead-wrap aso-col-3 " + (this.assuranceDetail.channelType != 4 && " aso-col-4")}>
                                <div className="text-center">
                                    关键词
                                </div>
                                <div className="text-center">
                                    热度
                                </div>
                                <div className="text-center">
                                    当前排名
                                </div>
                                {this.assuranceDetail.channelType != 4 && (
                                    <div className="text-center">
                                        购买量(全天)
                                    </div>
                                )}
                            </div>
                        </div>
                        {!this.initLoading && this.assuranceDetail.keywords && this.assuranceDetail.keywords.map((val, index)=>{
                            return (
                                <div key={index} className={"aso-row aso-col-3 optimize-keyword-row " + (this.assuranceDetail.channelType != 4 && " aso-col-4")}>
                                    <div style={{color: val.initRank == '-' && '#ff2b45'}}>{val.keyword}</div>
                                    <div>{val.initHot}</div>
                                    <div title={val.initRank == '-'? '未覆盖': val.initRank}>{val.initRank}</div>
                                    {this.assuranceDetail.channelType != 4 && (
                                        <div>{val.buyDownload}</div>
                                    )}
                                </div>						
                            )
                        })}
                        <Loading show={this.initLoading}/>
                        <NoData show={!this.initLoading && !(this.assuranceDetail.keywords && this.assuranceDetail.keywords.length)}/>
                        {this.isSchemeInfo ? this.loadAssuranceBase() : this.loadAssurancePay()}
                    </div>
                </section>
                <ToastContainer ref="container"
	                        	toastMessageFactory={ToastMessageFactory}
	                        	className="toast-top-right" />
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
            </div>
		);
    }
    loadAssuranceBase() {
        return (
            <div className="text-center">
                <Button  style={{marginTop: 40}} bsClass="btn" bsStyle="primary" className="aso-style pay-btn clipboard-copy" data-clipboard-text={this.createOrderLink}>复制付款链接</Button>
                <Button  style={{marginTop: 40}} onClick={() => {
                    this.props.history.push('/dashboard/assurances');
                }} bsClass="btn" bsStyle="primary" className="aso-style aso-style--white pay-btn">返回我的订单</Button>
            </div>
        );
    }
    loadAssurancePay() {
        return (
            <div>
                {this.assuranceDetail.orderStatus == 0 ? (
                    <div>
                        <div className="pay-way">
                            <dt>在线支付</dt>
                            <dd onClick={()=>{this.payWay = 1;}} className={this.payWay === 1 && "active"}><img height="32" src={require('../images/alipay-min.png')}/></dd>
                            <dd onClick={()=>{this.payWay = 2;}} className={this.payWay === 2 && "active"}><img height="32" src={require('../images/weixinpay-min.png')}/></dd>
                            <dd onClick={()=>{this.payWay = 6;}} className={this.payWay === 6 && "active"}><img height="32" src={require('../images/bank-min.png')}/></dd>
                        </div>
                        <dl className="pay-money">
                            <dt>应付金额 :</dt>
                            <dd>
                                <span>{parseFloat(this.assuranceDetail.fee).toFixed(2) || 0.00}</span>
                                <span>元</span>
                            </dd>
                        </dl>
                        <dl className="pay-money">
                            <dt>共享到我的账号 :</dt>
                            <div className="aso-nav__search">
                                <input type="text" placeholder="输入账号" onChange={(evt)=> {
                                    let input = evt.target.value;
                                    this.informAccount = input;
                                }}/>
                            </div>
                            <p style={{marginTop: 6, color: '#999', height: 34, lineHeight: '34px'}} >(选填)请填写66aso账号或手机号，便于查看及确认订单</p>
                        </dl>
                        <Button  style={{marginTop: 8}} onClick={this.toPayAssurance.bind(this)}  disabled={this.assuranceDetail.fee <= 0} bsClass="btn" bsStyle="primary" className="aso-style pay-btn fixed-width-btn">去支付</Button>
                    </div>
                ) : (
                    <div style={{height: 15}}></div>
                )}
            </div>
        )
    }
    loadAssuranceInfo(){
		Service.assuranceInfo({
            tradeNo: this.props.match.params.tradeNo,
            encryptionStr: this.props.match.params.encryptionStr
        }).then((response)=>{
			if (response.data.status === 200) {
				this.assuranceDetail = response.data.data;
			}
		})
	}
    toast(error, type = 'warning') {
        this.refs.container[type]("", error || "支付失败", {
            timeOut: 3000,
            extendedTimeOut: 0,
            showAnimation: 'animated fadeInDown',
            hideAnimation: 'animated fadeOutUp',
        });
    }
    checkIsPay() {
        return new Promise((resolve, reject)=>{
            Service.checkIsPay(this.assuranceDetail.tradeNo, 'assurance').then((res)=>{
                if (res.data.status === 200) {
                    resolve();
                } else {
                    reject();
                }
            }).catch(()=>{
                reject();
            });
        });
    }
    confirmPayStatus() {
        this.checkIsPay().then(()=>{
            window.location.reload();
		}).catch(()=>{
            this.showConfirmModal = false;
            this.toast('支付失败');
        });
    }
    toPayAssurance() {
        // 是否输入我的账号
        let accout = this.informAccount.trim();
        if ((accout!= "" && (phoneValidate.test(accout) || emailValidate.test(accout))) || accout== "")  {
            this.paying = true;
            if (!utils.isIos()) {
                this.newWindow = window.open("about:blank",'_blank');
                if (this.payWay != 6) {
                    this.newWindow.document.title = "创建订单";
                    this.newWindow.document.body.innerHTML = '<img src="http://cdn.coolguang.com/public/66aso/images/loading.gif" style="margin:120px auto;display:block;height:230px;"/>';
                }
            }
            let params = {
                tradeNo: this.assuranceDetail.tradeNo,
                payType: this.payWay,
                informAccount: this.informAccount.trim()
            }
            Service.createAssurancePay(params).then((response)=>{
                if (response.data.status === 200) {
                    if (this.payWay === 1) {
                        if (!utils.isIos()) {
                            this.newWindow.location.href = response.data.data.data;
                        }
                        else {
                            window.location.href = response.data.data.data;
                        }
                    }
                    else if (this.payWay === 6) {
                        if (!utils.isIos()) {
                            this.newWindow.location.href = bankUrl + '?url=' + encodeURIComponent(response.data.data.data);
                        }
                        else {
                            window.location.href = bankUrl + '?url=' + encodeURIComponent(response.data.data.data);
                        }
                    }
                    else {
                        if (!utils.isIos()) {
                            this.newWindow.location.href = `${window.location.origin}/wxpay/assurance/${this.assuranceDetail.tradeNo}/0`;
                        }
                        else {
                            window.location.href = `${window.location.origin}/wxpay/assurance/${this.assuranceDetail.tradeNo}/0`;
                        }
                    }
                    this.showConfirmModal = true;
                }
                else {
                    this.showConfirmModal = false;
                    !utils.isIos() && this.newWindow.close();  
                    this.toast(response.data.msg);
                }
                this.paying = false;
            }).catch(()=>{
                this.paying = false;
                this.showConfirmModal = false;
                !utils.isIos() && this.newWindow.close();  
            });
        }
        else {
            this.toast('共享账号格式不正确，请输入邮箱或者手机号');
        }
    }
})
