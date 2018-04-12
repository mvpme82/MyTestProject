import React, { Component } from 'react';
import {observer} from "mobx-react";
import mobx, {extendObservable} from "mobx";
import Service from '../../service';
import config from '../../config';
import utils from '../../utils';
import KeywordList from '../../components/KeywordList';
import RecentRank from '../../components/RecentRank';
import CurrentRank from '../../components/CurrentRank';
import OrderInfoRank from '../../components/OrderInfoRank';
import OrderInfoStatus from '../../components/OrderInfoStatus';
import { Accordion, Panel, ButtonGroup, Button,Modal,Popover,OverlayTrigger } from 'react-bootstrap';
import MyPagination from '../../components/MyPagination';
import moment from 'moment';
import Loading from '../../components/Loading';
import NoData from '../../components/NoData';
//初始化剪切板
import Clipboard from 'clipboard';
var clipboard = new Clipboard('.clipboard-copy1');

var ReactToastr = require("react-toastr");
var {ToastContainer} = ReactToastr;
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);
const phoneValidate = /^1[3|4|5|7|8][0-9]{9}$/; //手机号正则
const emailValidate =  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; //邮箱正则

export default observer(class Minitors extends Component {
    constructor(props){
        super(props); 
        extendObservable(this,{
            optimizes: [],
            activePage: 1,
            totalPage: 0,
            currentDate: moment(),
            initLoading: true,
            assuranceShow: false,
            mTop: this.showVertical(),
            shareAccounts: [],
            assuranceUpdateIndex: -1,
            copyUrl: ''
        });
        this.cleanShare();
        utils.getRealTime().then((time)=>{
            this.currentDate = time;
        });
        this.loadMyAssurance(this.activePage);
    }
    componentDidMount(){
        clipboard.on('success', e => {
            this.toast('链接已复制', 'success');
        });
    }
    render() {
        return (
            <div>
                <div className="aso-thead aso-row">
                    <div className="aso-thead-wrap">
                        <div className="text-left col-2">应用</div>
                        <div className="text-center col-1">词量</div>
                        <div className="text-center col-1">目标排名</div>
                        <div className="text-center col-1">执行金额</div>
                        <div className="text-center col-2">排期时间</div>
                        <div className="text-center col-1">订单明细</div>
                        <div className="text-center col-1">到榜率</div>
                        <div className="text-center col-1">当日排名</div>
                        <div className="text-center col-1">状态</div>
                        <div className="text-center col-1">操作</div>
                    </div>
                </div>
                {!this.initLoading && this.optimizes.map((val, key) => {
                    return (
                        <div key={key} className="common-item-wrapper">
                            <div className="common-item plan-item dash-orders">
                                <div className="text-left col-2">
                                    <img src={val.icon} width="70" height="70" className="plan-item__icon pull-left img-text-fixed"/>
                                    <dl className="dash-appinfo">
                                        <dt title={val.title} className="aso-trancate">{val.title}</dt>
                                        <dd title={val.appId} className="aso-trancate">{val.appId}</dd>
                                    </dl>
                                </div>
                                <div className="text-center col-1">
                                    {utils.getKeywordCount(val.keywords)}
                                </div>
                                <div className="text-center col-1">
                                    {config.expectRank[val.expectRank]}
                                </div>
                                <div className="text-center col-1">{val.fee}</div>
                                <div className="text-center col-2">
                                    <div>{moment(val.startTime).format('MM-DD')} 至 {moment(val.endTime).format('MM-DD')}</div>
                                </div>
                                <div className="text-center col-1">
                                    <a className={"aso-aelem" + (val.expand && val.seeOrderInfoRank ? " aso-aelem--active" : "")} onClick={this.seeOrderInfoRank.bind(this, val)}>
                                        详情
                                        <i className="arrow"></i>
                                    </a>
                                </div>
                                <div className="text-center col-1">
                                    <a className={"aso-aelem" + (val.expand && val.seeRecentRank ? " aso-aelem--active" : "")} onClick={this.seeRecentRank.bind(this,val)}>
                                        详情
                                        <i className="arrow"></i>
                                    </a>
                                </div>
                                <div className="text-center col-1">
                                    <a className={"aso-aelem" + (val.expand && val.seeCurrentRank ? " aso-aelem--active" : "")} onClick={this.seeCurrentRank.bind(this,val)}>
                                        详情
                                        <i className="arrow"></i>
                                    </a>  
                                </div>
                                <div className="text-center col-1" title={val.businessStatus}>
                                    <a className={"aso-aelem" + (val.expand && val.seeOrderRank ? " aso-aelem--active" : "")} onClick={this.seeOrderRank.bind(this,val)}>
                                        {val.businessStatus}
                                    </a>  
                                </div>
                                {this.showAssuranceBtn(val, key)}
                               
                            </div>
                            <Panel collapsible expanded={val.expand} className="aso-detail-panel">
                                {val.seeOrderInfoRank && (
                                    <OrderInfoRank  type="assurance" entityData={val}/>
                                )}
                                {val.seeOrderRank && (
                                    <OrderInfoStatus entityId={val.tradeNo}/>
                                )}
                                {val.seeRecentRank && (
                                    <RecentRank onSelect={(date)=>{
                                        this.enterCurrentRank(date, val);
                                    }} type="assurance" entityId={val.tradeNo}/>) }
                                {val.seeCurrentRank && (<CurrentRank rank={val.expectRank} index={key} date={this.currentDate} type="assurance" entityId={val.tradeNo}/>) }
                            </Panel>      
                        </div>
                    )
                })}
                <Loading show={this.initLoading}/>
                <NoData show={!this.initLoading && !this.optimizes.length}/>
                { 
                    this.totalPage > 1 && (
                        <MyPagination 
                            activePage={this.activePage} 
                            items={this.totalPage} 
                            onSelect={this.handleSelect.bind(this)}
                            prev={()=>{ this.handleSelect.bind(this, this.activePage - 1)() }}
                            next={()=>{ this.handleSelect.bind(this, this.activePage + 1)() }}
                        />
                    )
                }
                <ToastContainer ref="container"
	                        	toastMessageFactory={ToastMessageFactory}
	                        	className="toast-top-right" />
                <Modal backdrop="static" dialogClassName="base-recharge-modal" show={this.assuranceShow}  onHide={this.close.bind(this)} style={{paddingTop: this.mTop + 'px'}}>
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-sm">
                            共享至客户账号
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="assurance-modal-body">
                            {this.shareAccounts.map((data, index) => {
                                return (
                                    <div className="share-people" key={`key-${index}`}>
                                        <label>共享{index + 1}： </label>
                                        {data.accountType == 1 ? (
                                            <div className="aso-nav__label">
                                                <b>{data.account}</b>
                                            </div>
                                        ) : (
                                            <div className="aso-nav__search">
                                                <input  placeholder="请输入对方账号" defaultValue={data.account} onChange={(evt)=> {
                                                    if  (data.accountType == 0) {
                                                        let input = evt.target.value;
                                                        this.shareAccounts[index].account = input;
                                                    }
                                                }} onBlur = {(evt)=> {
                                                    let input = evt.target.value;
                                                    if ((input!= "" && (phoneValidate.test(input) || emailValidate.test(input))) || input== "")  {
                                                        // 不处理
                                                    }
                                                    else {
                                                        this.toast('共享' + (index + 1) + '格式不正确，请输入邮箱或者手机号', 'warning');
                                                    }
                                                }}/>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="btnContainer">
                            <span className="login_btn login_btn_le_0" onClick={this.shareOrderBtn.bind(this)}>确定</span>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
    close() {
        this.assuranceShow = false;
    }
    showVertical() {
        var h = 410;
        return  (document.documentElement.clientHeight - h) / 2 - 30;
    }
    formatOrderParams(data){
        var {optimizeDatetime, taskType, channelId, expectRank, appId, keywords, schemeId} = data;
        return `${appId}/${schemeId}/${taskType}/${channelId}/${expectRank}/${optimizeDatetime}/${keywords}`
    }
    
    enterCurrentRank(date, val){
        this.currentDate = moment(date);
        this.seeCurrentRank(val);
    }

    seeCurrentRank(val){
        if (val.expand  && val.seeCurrentRank) {
            val.expand = false;
        }
        else {
            val.expand = true;
        }
        
        val.seeCurrentRank = true;
        val.seeRecentRank = false;  
        val.seeOrderRank = false;
        val.seeOrderInfoRank = false;
    }

    seeRecentRank(val){
        if (val.expand && val.seeRecentRank) {
            val.expand = false;
        }
        else {
            val.expand = true;
        }
        val.seeRecentRank = true;
        val.seeCurrentRank = false;
        val.seeOrderRank = false;
        val.seeOrderInfoRank = false;
    }
    seeOrderRank(val) {
        if (val.expand && val.seeOrderRank) {
            val.expand = false;
        }
        else {
            val.expand = true;
        }
        val.seeOrderRank = true;
        val.seeRecentRank = false;
        val.seeCurrentRank = false;
        val.seeOrderInfoRank = false;
    }

    seeOrderInfoRank(val) {
        if (val.expand && val.seeOrderInfoRank) {
            val.expand = false;
        }
        else {
            val.expand = true;
        }
        
        val.seeOrderInfoRank = true;
        val.seeOrderRank = false;
        val.seeRecentRank = false;
        val.seeCurrentRank = false;
    }

    handleSelect(page){
        this.loadMyAssurance(page);
    }

    
    loadMyAssurance(page){
        Service.assuranceList({
            pageSize: 20,
            currentPage: page
        }).then((res) => {
            if (res.data.status === 200 && res.data.data) {
                this.totalPage = res.data.data.totalPage;
                this.activePage = res.data.data.pageNo;
                this.optimizes = res.data.data.result.map((val)=>{
                    val.expand = true;
                    val.seeOrderInfoRank = false;
                    val.seeCurrentRank = false;
                    val.seeRecentRank = false;
                    val.seeOrderRank = false;
                    val.businessStatus = ['待支付', '支付成功', '执行订单', '确认订单', '交易完成'][+val.orderStatus];
                    val.copylink = `${window.location.origin}/assurance/pay/${val.tradeNo}/${val.encryptionStr}`;
                    val.qrImg = config.HOST + config.QR_IMG + '?content=' + val.copylink;
                    return val;
                }).sort((val1, val2)=>{
                    return val2.createTime - val1.createTime;
                });
                window.scrollTo(0, 0);
            }
            this.initLoading = false;
        }).catch(()=>{
            this.initLoading = false;
        })
    }
    
    copyOrder(tNo) {
        Service.urlShare({
            tradeNo: tNo
        }).then((res)=>{
            this.copyUrl = `${window.location.origin}/assurance/pay/${tNo}/${res.data}`;
		});
    }
    shareOrder(index) {
        let val = this.optimizes[index];
        this.cleanShare();
        for (let i = 0; i < val.shareList.length; i++) {
            this.shareAccounts[i] = val.shareList[i];
        }
        this.assuranceShow = true;
        this.assuranceUpdateIndex = index;
    }

    cleanShare() {
        this.shareAccounts = [];
        for (let i = 0; i < 5; i++) {
            this.shareAccounts.push({
                account: "",
                accountType: 0
            })
        };
    }
    shareOrderBtn() {
        let arr = [];
        let val = this.optimizes[this.assuranceUpdateIndex];
        for (let i = 0; i < this.shareAccounts.length; i++) {
            let accout = this.shareAccounts[i].account;
            if (accout) {
                if (phoneValidate.test(accout) || emailValidate.test(accout))  {
                    arr.push(accout);
                }
                else {
                    this.toast('共享' + (i + 1) + '格式不正确，请输入邮箱或者手机号', 'warning');
                    return;
                }
            }
        }

        // 判断数据是否有重复数据
        if (utils.isArrayRepeat(arr)) {
            this.toast('共享数据存在重复，请仔细校验', 'warning');
            return;
        }
        Service.assuranceShare({
            tradeNo: val.tradeNo,
            shareAccounts: JSON.stringify(arr)
        }).then((res) => {
            if (res.data.status === 200) {
                this.toast('共享成功', 'success');
                this.optimizes[this.assuranceUpdateIndex].shareList = this.shareAccounts;
            }
            else {
                this.toast(res.data.msg, 'error');
            }
            this.assuranceShow = false;
        });
    }
    confirmOrder(val) {
        Service.confirmOrder({
            tradeNo: val.tradeNo
        }).then((res) => {
            if (res.data.status === 200) {
                val.orderStatus = 4;
                this.toast('订单确认成功', 'success');
            }
            else {
                this.toast(res.data.msg, 'error');
            }
        });
    }
    toast(error, type = 'warning') {
        this.refs.container && this.refs.container[type]("", error || "支付失败", {
            timeOut: 3000,
            extendedTimeOut: 0,
            showAnimation: 'animated fadeInDown',
            hideAnimation: 'animated fadeOutUp',
        });
    }

    /**
     * 显示每一行最后一列按钮
     * 
     * @param {Object} val 
     */
    showAssuranceBtn(val, index) {
        if (val.isMain ==1 ) {
            if (val.orderStatus == 0) {
                return (
                    <div className="text-center col-1 show">
                        <i className="aso-icon-add" title="再次购买" onClick={()=>{
                            this.props.history.push({
                                pathname:  `/assurance/detail/${val.appId}`,
                                again: true,
                                orderdetail: {
                                    keywords: val.keywords,
                                    expectRank: val.expectRank,
                                    serviceType: val.channelType
                                },
                                fee: val.fee
                            })
                        }}></i>
                        <i className="aso-icon-link clipboard-copy1"  title="复制付款链接" data-clipboard-text={val.copylink}></i>
                        <i className="aso-i-qrCode aso-icon-weixin" title="微信分享">
                            <div className="qrCode-wrap">
                                <img  src={val.qrImg}  alt="发给客户付款"/>
                                <p className="txt-1">发给客户付款</p>
                            </div>
                        </i>
                    </div>  
                );
            }
            return (
                <div className="text-center col-1">
                    <i className="aso-icon-add" title="再次购买" onClick={()=>{
                        this.props.history.push({
                            pathname:  `/assurance/detail/${val.appId}`,
                            again: true,
                            orderdetail: {
                                keywords: val.keywords,
                                expectRank: val.expectRank,
                                serviceType: val.channelType
                            },
                            fee: val.fee
                        })
                    }}></i>
                    <i className="aso-icon-share"  title="共享" onClick={this.shareOrder.bind(this, index)}></i>
                </div>  
            )
        }
        else if (val.isPayUser) {
            if (val.orderStatus == 0 || val.orderStatus == 4) {
                return (
                    <div className="text-center col-1">-</div>  
                )
            }
            return (
                <div className="text-center col-1">
                    <i className="aso-icon-price" title="确认订单" onClick = { () => {
                        this.confirmOrder(val);
                    }}></i>
                </div>  
            )
            
        }
        return (
            <div className="text-center col-1">-</div>  
        )
    }
});