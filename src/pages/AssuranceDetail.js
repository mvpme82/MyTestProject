import React, { Component , PropTypes} from 'react';
import FilterAccordion from '../components/FilterAccordion';
import KeywordList from '../components/KeywordList';
import SegmentedControl from '../components/SegmentedControl';
import KeywordImport from '../components/KeywordImport';
import MyPagination from '../components/MyPagination';
import {observer} from "mobx-react";
import {extendObservable,computed,autorun} from "mobx";
import { Accordion, Panel, Form, Col, ButtonGroup, Button, FormGroup, ControlLabel,Checkbox,FormControl,InputGroup,Tooltip,OverlayTrigger } from 'react-bootstrap';
import Service from '../service';
import DatePicker from 'react-datepicker';
import * as mobx from 'mobx';
import auth from '../auth';
import utils from '../utils';
import config from '../config';
import SortSpan from '../components/SortSpan';
import ChannelFilter from '../components/ChannelFilter';
import objectAssign from 'object-assign';
import _ from 'underscore';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import KeywordsEdit from '../components/KeywordsEdit';
import axios from 'axios';
import InputNumber from 'rc-input-number';
import Clipboard from 'clipboard';
// 引入登录弹框功能
import UserBase from '../components/UserBase';
import FormSelect from '../components/form-component/select';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
//初始化剪切板
var clipboard = new Clipboard('.clipboard-copy');
var ReactToastr = require("react-toastr");
var {ToastContainer} = ReactToastr;
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

var qrCodeUrl = config.HOST + config.QR_IMG + '?content=';

const queryString = require('query-string');
class AsoTimeInput extends React.Component {
    render () {
        return (
            <FormControl
                type="text"
                value={this.props.value}
                readOnly
                onChange={(evt)=>{
                }}
                onClick={this.props.onClick}
            />
        )
    }
}

AsoTimeInput.propTypes = {
    onClick: PropTypes.func,
    value: PropTypes.string
};
export default observer(class AssuranceDetail extends Component {

    constructor(props){
        super(props);
        auth.checkStatus();
        extendObservable(this,{
            appdetail: {},
            orderData: {
                keywords: "",
                expectRank: 3,
                serviceType: 0
            },
            error: {
                orderKeyword: false,
                hasUselessKeywords: false
            },
            isEmpty: false,
            today: moment(),
            startDate: moment(),
            endDate: moment().add(6, 'days'),
            payMoney:0,
            payMoneyInput: false,
            initLoading: false,
            deleteLoading: false,
            keywordInfos: [],
            // 存储之前的购买量数据
            oldKeywordInfos: [],
            keywords: [],
            createOrderFlag: false,
            createOrderLink: '',
            baseModalShow: false,
            cleanKey: false,
            isSubmit: false, 
            downloadNum: computed(()=>{
                let num = 0;
                if (this.orderData.serviceType != 4) {
                    if (this.keywordInfos) {
                        this.keywordInfos.forEach((val)=>{
                            num += Number(val.buyDownload);
                        });  				
                    }
                }
                else {
                    num = 1;
                }
                return num;
			})
        });
        // 再次购买
        if (this.props.location.again) { 
            objectAssign(this.orderData, this.props.location.orderdetail);
            this.payMoney = this.props.location.fee;
        }

    }
    componentDidMount(){
        let appId = this.props.match.params.appId;
        this.loadAppInfo(appId); //获取应用信息
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
            <div className="aso-appdetail">
                <section className="aso-container">
                    <div className="clearfix aso-commonheading">
                        <div className="pull-left">
                            <img className="aso-normal-icon" alt="" src={this.appdetail.icon}/>
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
                    {this.renderKeywordsTextarea(this.orderData, 'orderKeyword')}       
                    <div className="pay-body">
                        <div className="pay-info">
                            {this.renderAssuranceOrder()}
                            <div className="aso-thead">
                                <div  className={"aso-row aso-thead-wrap aso-col-4 " + (this.orderData.serviceType != 4 && " aso-col-5")}>
                                    <div className="text-center">
                                        关键词
                                    </div>
                                    <div className="text-center">
                                        热度
                                    </div>
                                    <div className="text-center">
                                        当前排名
                                    </div>
                                    {this.orderData.serviceType != 4 && (
                                        <div className="text-center">
                                            购买量(全天)
                                        </div>
                                    )}
                                    <div className="text-center">
                                        操作
                                    </div>
                                </div>
                            </div>
                            {!this.initLoading && this.keywordInfos.map((val, index)=>{
                                return (
                                    <div  key={index} className={"aso-row aso-col-4 optimize-keyword-row  " + (this.orderData.serviceType != 4 && " aso-col-5")}>
                                        <div>{val.keyword}</div>
                                        <div>{val.hot}</div>
                                        <div title={val.rank == '-'? '未覆盖': val.rank}>{val.rank}</div>
                                        {this.orderData.serviceType != 4 && (
                                            <div>
                                                <InputNumber 
                                                    precision={0} 
                                                    min={0} 
                                                    formatter={(input)=> {
                                                        if (!/^[0-9]{1,}$/.test(input)) {
                                                            return 0;
                                                        }
                                                        return input;
                                                    }}
                                                    value={val.buyDownload} 
                                                    onChange={(value)=>{ 
                                                        val.buyDownload = value; 
                                                        this.isSubmit = false;
                                                    }}/>
                                            </div>
                                        )}
                                        <div><span title="删除" onClick={this.deleteKeyword.bind(this,val.id,index)} className="aso-icon-delete">X</span></div>
                                    </div>						
                                )
                            })}
                            <Loading show={this.initLoading}/>
                            <NoData show={!this.initLoading && !this.keywordInfos.length}/>
                            <div className="text-center">
                                <Button bsClass="btn" bsStyle="primary"  disabled={!this.keywordInfos.length || this.isSubmit}  className="aso-style pay-btn fixed-width-btn" onClick={this.createOrder.bind(this)}>生成订单</Button>
                            </div>
                            {/* {this.createOrderFlag && (
                                <div className="text-center assurance-link">
                                    <span className="assurance-link-label">请将此链接发给待付款用户：</span>
                                    <OverlayTrigger  placement="top" overlay={<Tooltip id="t-name">{this.createOrderLink}</Tooltip>}>
                                        <span className="assurance-link-label assurance-link-middle aso-trancate">{this.createOrderLink}</span>
                                    </OverlayTrigger>
                                    <div className="assurance-i" title="复制">
                                        <a href="javascript:;" className="clipboard-copy assurance-icon assurance-copy" data-clipboard-text={this.createOrderLink}> </a>
                                    </div>
                                    <div className="assurance-i aso-i-qrCode">
                                        <a className="assurance-icon assurance-weixin"></a>
                                        <div className="qrCode-wrap">
                                            <img  src={qrCodeUrl + this.createOrderLink} alt="分享到微信"/>
                                            <p className="txt-1">分享到微信</p>
                                        </div>
                                    </div>
                                </div>
                            )} */}
                        </div>
                    </div>
                    <ToastContainer ref="container"
                        toastMessageFactory={ToastMessageFactory}
                        className="toast-top-right" />
                </section>
                <UserBase  hide={()=>{ this.baseModalShow = false; }} showType = "login" showModal = {this.baseModalShow} onChange={(data)=>{
                    this.beginCreateOrder();
                    this.baseModalShow = false;
                    auth.checkStatus();
                }}/>
            </div>
        );
    }

    renderAssuranceOrder(){
        return (
            <div className="pay-channel-filter">
                <div className="channel-filter">
                    <div className="aso-row clearfix">
                        <div className="col-2 aso-padding-l">
                            <FormGroup className="aso-formgroup">
                                <ControlLabel>服务类型:</ControlLabel>
                                <FormSelect type="top" data={[{
                                    index: 0,
                                    value: '快速安装任务'
                                }, {
                                    index: 1,
                                    value: '排重安装任务'
                                }, {
                                    index: 2,
                                    value: '激活任务'
                                }, {
                                    index: 3,
                                    value: '注册任务'
                                }, {
                                    index: 4,
                                    value: '保排名任务'
                                }]} value={this.orderData.serviceType} onChange={(evt) => {
                                    this.orderData.serviceType = evt.select;
                                    this.isSubmit = false;
                                }}></FormSelect>
                            </FormGroup>
                        </div>
                        <div className="col-2 aso-padding-l">
                            <FormGroup className="aso-formgroup">
                                <ControlLabel>目标排名:</ControlLabel>
                                <FormSelect type="top" data={[{
                                    index: 1,
                                    value: 'TOP1'
                                }, {
                                    index: 3,
                                    value: 'TOP3'
                                }, {
                                    index: 5,
                                    value: 'TOP5'
                                }, {
                                    index: 10,
                                    value: 'TOP10'
                                }]} task={this.orderData.serviceType} value={this.orderData.expectRank} onChange={(evt) => {
                                    this.orderData.expectRank = evt.select;
                                    this.isSubmit = false;
                                    this.keyDetailApp();
                                }}></FormSelect>
                            </FormGroup>
                        </div>
                        <div className="col-2  aso-padding-l">
                            <FormGroup className="aso-formgroup">
                                <ControlLabel>排期时间:</ControlLabel>
                                <DatePicker
                                    dateFormat="YYYY-MM-DD"
                                    minDate={this.today}
                                    maxDate={this.endDate}
                                    selected={this.startDate}
                                    selectsStart
                                    startDate={this.startDate}
                                    endDate={this.endDate}
                                    onChange={(date)=>{
                                        this.isSubmit = false;
                                        this.startDate = date;
                                    }}
                                    customInput={<AsoTimeInput />} 
                                />
                            </FormGroup>
                        </div>
                        <div className="aso-padding-l aso-padding-r fl">
                            <FormGroup className="aso-formgroup">
                                <ControlLabel>&nbsp;</ControlLabel>
                                <div style={{color:'#999', lineHeight: '34px'}}>至</div>
                            </FormGroup>
                        </div>
                        <div className="col-2  aso-padding-l">
                            <FormGroup className="aso-formgroup select-caret">
                                <ControlLabel>&nbsp;</ControlLabel>
                                <DatePicker
                                    minDate={this.startDate}
                                    dateFormat="YYYY-MM-DD"
                                    selected={this.endDate}
                                    selectsEnd
                                    startDate={this.startDate}
                                    endDate={this.endDate}
                                    onChange={(date)=>{
                                        this.isSubmit = false;
                                        this.endDate = date;
                                    }}
                                    customInput={<AsoTimeInput />} 
                                />
                            </FormGroup>
                        </div>
                        <div className="col-2  aso-padding-l">
                            <FormGroup className="aso-formgroup">
                                <ControlLabel>应付金额:</ControlLabel>
                                <InputGroup className={"form-control selecttype " + (this.payMoneyInput && "form-control-error")}>
                                    <FormControl type="text" value={this.payMoney} onChange={(evt)=> {
                                        let input = evt.target.value;
                                        this.isSubmit = false;
                                        this.payMoney =  input;
                                        this.payMoneyInput = false;
                                    }} onBlur={(evt)=> {
                                        let input = evt.target.value;
                                        if (isNaN(input) || input <= 0) {
                                            this.payMoney = 0;
                                        }
                                        else {
                                            this.payMoney = parseFloat(input).toFixed(2);
                                        }
                                    }}/>
                                    <InputGroup.Addon>元</InputGroup.Addon>
                                </InputGroup>
                            </FormGroup>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    renderKeywordsTextarea(data, errorKey){
        return (
            this.appdetail.appId && (
                <FormGroup className="aso-formgroup">
                    <ControlLabel>请填写您想要优化的关键词</ControlLabel>
                    <KeywordsEdit
                        value={data.keywords}
                        showerror={errorKey === 'orderKeyword' ? 1 : 0}
                        ref={(ke) => { this._ke = ke; }}
                        onChange={(evt, value)=>{
                            data.keywords = value;
                            this.isSubmit = false;
                            // 是否符合规则
                            this.error[errorKey] = false;
                            if (this.cleanKey) {
                                this.keywords = value;
                                this.keyDetailApp();
                            }
                        }}
                        onBlur={(evt, value)=>{
                            data.keywords = value.trim();
                            var that = this;
                            if (value) {
                                if (!utils.checkIsValidNew(value)) {
                                    this.isEmpty = true;
                                    return;
                                }
                                this.isEmpty = false;
                                if (errorKey === 'orderKeyword') {
                                    Service.getKeywordRank({
                                        appId: this.appdetail.appId,
                                        keywords:  utils.joinValid(data.keywords)
                                    }).then((res)=>{
                                        if (res.data.status === 200) {
                                            var error = [];
                                            for (var i in res.data.data) {
                                                if (res.data.data[i] == '-'){
                                                    error.push(i); 
                                                }
                                            }
                                            if (error.length) {
                                                this.error.hasUselessKeywords = true;
                                                this._ke.markError(error);
                                            }
                                            else{
                                                this.error.hasUselessKeywords = false;
                                            }
                                        }
                                    });
                                }
                                
                                // 获取key
                                this.keywords = data.keywords;
                                this.keyDetailApp();
                            }
                            else {
                                this.error.hasUselessKeywords = false;
                            }
                        }}
                        placeholder="输入一个或多个关键词，使用逗号、顿号、分号或换行分隔"
                    />
                    <KeywordImport onImported={(keywords)=>{
                        let oldkeywords = data.keywords,
                            len = oldkeywords.length;
                        this.isSubmit = false;
                        if (!len) {
                            data.keywords = keywords;
                        }
                        else {
                            let charCode = oldkeywords[len - 1],
                                comma = utils.comma();
                            // 前面是分号 直接append
                            if (charCode === comma[0] || charCode === comma[1]) { 
                                data.keywords = oldkeywords + keywords;
                            }
                            else {
                                 // 不是分号
                                data.keywords = oldkeywords + "," + keywords;
                            }
                        }
                        // 是否符合规则
                        this.error[errorKey] = false;
                        this._ke.init(data.keywords);
                    }}/>

                    {errorKey === 'orderKeyword' && this.error.hasUselessKeywords && (
                        <a className="keyword-import-btn" onClick={(evt) => {
                            this.cleanKey = true;
                            this._ke.cleanError();
                            this.error.hasUselessKeywords = false;
                        }}>清空无效关键词</a>
                    )}
                    {this.error[errorKey] && (<div className="aso-error pull-right">关键词不能超16个汉字或32个字符</div>) }
                    {this.isEmpty  && (<div className="aso-error pull-right">请输入正确的关键词</div>)}
                </FormGroup>
            )
        )
    }

    loadAppInfo(appId){
        Service.getAppInfo(appId).then((res)=>{
            if (res.data.status === 200) {
                this.appdetail = res.data.data;
                if (this.appdetail && this.appdetail.categoryId) {
                    this.currentFilterParams = {
                        category_id: this.appdetail.categoryId
                    }
                }
            }
        });
    }

    keyDetailApp() {
        if (this.keywords) {
            let keywords = utils.joinValid(this.keywords);
            Service.keyDetail({
                appId: this.appdetail.appId,
                keywords: keywords,
                expectRank: this.orderData.expectRank
            }).then((res) => {
                if (res.data.status === 200 && res.data.data) {
                    this.keywordInfos = res.data.data.map((val)=>{
                        val.buyDownload = this.getOldBuyDownload(val.keyword);
                        return val;
                    });
                    this.oldKeywordInfos  = this.keywordInfos;
                }
                else {
                    this.keywordInfos = [];
                }
            });
        }
        else {
            this.keywordInfos = [];
        }
        this.cleanKey = false;
    }

    // 当重新编辑的时候，获取之前的购买量
    getOldBuyDownload(keys) {
        for (let i = 0; i < this.oldKeywordInfos.length; i++) {
            let val = this.oldKeywordInfos[i];
            if (val.keyword == keys) {
                return val.buyDownload;
            }
        }
        return 0;
    }
    deleteKeyword(id, index){
		if (this.deleteLoading) {
			return;
		}
        this.deleteLoading = true;
        this.keywordInfos.splice(index,1);
        this.deleteLoading = false;
        this.isSubmit = false;
    }
    
    createOrder() {
        if(this.payMoney <= 0) {
            this.payMoneyInput = true;
            this.refs.container.warning("", "应付金额必须大于0元", {
                timeOut: 3000,
                extendedTimeOut: 0,
                showAnimation: 'animated fadeInDown',
                hideAnimation: 'animat ed fadeOutUp',
            });
            return;
        }
        auth.checkStatus().then((isLogin)=>{
            if (isLogin) {
                this.beginCreateOrder();
            }
            else {
                this.baseModalShow = true;
            }
        });
    }
    beginCreateOrder () {       
        Service.createAssurance({
            appId: this.appdetail.appId,
            keywordData: JSON.stringify(this.keywordInfos),
            startTime: this.startDate.format('YYYY-MM-DD'),
            endTime: this.endDate.format("YYYY-MM-DD"),
            expectRank: this.orderData.expectRank,
            channelType: this.orderData.serviceType,
            payMoney: this.payMoney
        }).then((res)=>{
			if (res.data.status === 200) {
                this.isSubmit = true;
                // this.refs.container.success("", "订单生成成功", {
                //     timeOut: 3000,
                //     extendedTimeOut: 0,
                //     showAnimation: 'animated fadeInDown',
                //     hideAnimation: 'animat ed fadeOutUp',
                // });
                this.encryptionUrl(res.data.data.tradeNo);
			}
			else {
				this.createOrderFlag = false;
			}
		}).catch(()=>{
			this.createOrderFlag = false;
		})
    }
    encryptionUrl(tno) {
        Service.urlShare({
            tradeNo: tno
        }).then((res)=>{
            this.createOrderFlag = true;
            window.location.href = `${window.location.origin}/assurance/info/${tno}/${res.data}`;
            // this.createOrderLink = `${window.location.origin}/assurance/pay/${tno}/${res.data}`;
		}).catch(()=>{
			this.createOrderFlag = false;
		});
    }
});

