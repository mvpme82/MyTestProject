import React, { Component } from 'react';
import {observer} from "mobx-react";
import mobx, {extendObservable} from "mobx";
import Service from '../../service';
import config from '../../config';
import utils from '../../utils';
import KeywordList from '../../components/KeywordList';
import RecentRank from '../../components/RecentRank';
import CurrentRank from '../../components/CurrentRank';
import { Accordion, Panel, ButtonGroup, Button } from 'react-bootstrap';
import MyPagination from '../../components/MyPagination';
import Loading from '../../components/Loading';
import NoData from '../../components/NoData';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

export default observer(class Minitors extends Component {
    constructor(props){
        super(props); 
        extendObservable(this,{
            optimizes: [],
            activePage: 1,
            totalPage: 0,
            currentDate: moment(),
            initLoading: true
        });
        this.state = {
            isLoad: true
        }
        utils.getRealTime().then((time)=>{
            this.currentDate = time;
        });
        this.loadMyOptimize(this.activePage);
    }
    render() {
        return (
            <div>
                <div className="aso-thead aso-row">
                    <div className="aso-thead-wrap">
                        <div className="text-left col-2">应用</div>
                        <div className="text-center col-1">词量</div>
                        <div className="text-center col-1">目标排名</div>
                        <div className="text-center col-1">渠道商</div>
                        <div className="text-center col-1">类型</div>
                        <div className="text-center col-1">执行金额</div>
                        <div className="text-center col-1">执行时间</div>
                        <div className="text-center col-1">到榜率</div>
                        <div className="text-center col-1">当日排名</div>
                        <div className="text-center col-1">状态</div>
                        <div className="text-center col-1">操作</div>
                    </div>
                </div>
                {!this.initLoading && this.optimizes.map((val, key) => {
                    return (
                        <div key={key} className="common-item-wrapper common-item-wrapper-monitor">
                            <div className="common-item plan-item dash-orders">
                                <div className="text-left col-2">
                                    <img src={val.icon} width="70" height="70" className="plan-item__icon pull-left img-text-fixed"/>
                                    <dl className="dash-appinfo dash-appinfo-new">
                                        <dt title={val.title} className="aso-trancate">{val.title}</dt>
                                        <dd title={val.appId} className="aso-trancate">{val.appId}</dd>
                                    </dl>
                                </div>
                                <div className="text-center col-1">
                                    {val.keywordInfos.length}
                                </div>
                                <div className="text-center col-1">
                                    {config.expectRank[val.expectRank]}
                                </div>
                                <div className="text-center col-1" title={val.channelName}>{val.channelName}</div>
                                <div className="text-center col-1" title={val.taskTypeName}>{val.taskTypeName}</div>
                                <div className="text-center col-1">{val.fee}</div>
                                <div className="text-center col-1">
                                    {moment(val.optimizeDatetime).format('MM-DD')}
                                    {val.taskType != 4 && (
                                        <span> {moment(val.optimizeDatetime).format('HH:mm')}</span>
                                    )}                                    
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
                                    {val.businessStatus}
                                </div>
                                {val.businessStatus == '待支付' && (
                                    <div className="text-center col-1">
                                        <i className="aso-icon-cart" title="继续购买" onClick={()=>{
                                            window.location.href = `${window.location.origin}/optimizepay/${this.formatOrderParams(val)}/${val.tradeNo}`;
                                            {/* this.props.history.push({
                                                pathname:  `/optimizepay/${this.formatOrderParams(val)}/${val.tradeNo}`,
                                                buyAgain: true,
                                                orderdetail: val
                                            }); */}
                                        }}></i>
                                        <i className="aso-icon-remove " title="删除订单" onClick={this.delOrder.bind(this, val.tradeNo)}></i>
                                    </div>
                                )}
                                {val.businessStatus !== '待支付' && (
                                    <div className="text-center col-1">
                                        <i className="aso-icon-cart" title="再次购买" onClick={()=>{
                                            this.props.history.push({
                                                pathname:  `/appdetail/${val.appId}/open/order`,
                                                openorder: true,
                                                orderdetail: {
                                                    keywords: val.keywords,
                                                    expectRank: val.expectRank
                                                }
                                            })
                                        }}></i>
                                        <i className={"aso-icon-download " + (val.btnDisabled && "aso-icon-download-disabled")} title={val.btnDisabled ? (val.taskType == 4? '此类订单无IDFA' : '尚未生成IDFA') : '下载IDFA'} onClick={this.downLoad.bind(this, val.btnDisabled, val.tradeNo)}></i>
                                    </div>
                                )}

                                <div className="text-left col-12 order-remark aso-trancate">
                                    订单号： {val.tradeNo}
                                </div>
                            </div>
                            <Panel collapsible expanded={val.expand} className="aso-detail-panel">
                                {val.seeRecentRank && (
                                    <RecentRank onSelect={(date)=>{
                                        this.enterCurrentRank(date, val);
                                    }} onChange={(rank) => {
                                        val.arriveData = rank;
                                        this.updataArriveRank(val);
                                    }} type="optimize"  rankLeavel={val.arriveData}  orderType={val.taskType} entityId={val.tradeNo}/>) }
                                {val.seeCurrentRank && (<CurrentRank load={this.state.isLoad} index={key} rank={val.expectRank} date={this.currentDate} type="optimize" entityId={val.tradeNo}/>) }
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
            </div>
        )
    }
    formatOrderParams(data){
        var {optimizeDatetime, taskType, channelId, expectRank, appId, keywords, schemeId} = data;  
        keywords = keywords ? keywords : '-';
        return `${appId}/${schemeId}/${taskType}/${channelId}/${expectRank}/${optimizeDatetime}`
    }
    delOrder(id) {
        this.initLoading = true;
        Service.cancelOrder({
            tradeNo: id,
            order_type: 'optimize'
        }).then((res)=>{
            if (res.data.status === 200) {
                this.activePage = 1;
                this.loadMyOptimize(this.activePage);
            }
        });
    }
    downLoad(flag, no) {
        if (flag) {
            return;
        }
        Service.exportIDFA({
            tradeNo: no
        }).then((res)=>{
            if (res.data.status === 200) {
                utils.downloadFile(res.data.fileUrl);
            }
        });
    } 

    updataArriveRank(val) {
        Service.updateArrive({
            id: val.id,
            arriveData: val.arriveData
        }, 'optimize').then((res)=>{
            console.log(res.data);
        });
    }
    enterCurrentRank(date, val){
        this.currentDate = moment(date);
        this.seeCurrentRank(val);
    }

    seeCurrentRank(val){
        if (val.expand && val.seeRecentRank) {
        }
        else {
          val.expand = !val.expand;
        }
        val.seeCurrentRank = true;
        val.seeRecentRank = false;  
    }

    seeRecentRank(val){
        if (val.expand && val.seeCurrentRank) {
        }
        else {
            val.expand = !val.expand;
        }
        val.seeRecentRank = true;
        val.seeCurrentRank = false;
    }

    handleSelect(page){
        this.initLoading = true;
        this.loadMyOptimize(page);
    }

    loadMyOptimize(page){
        Service.getMyOptimize({
            pageSize: 20,
            currentPage: page
        }).then((res) => {
            if (res.data.status === 200 && res.data.data) {
                this.totalPage = res.data.data.totalPage;
                this.activePage = res.data.data.pageNo;
                this.optimizes = res.data.data.result.map((val)=>{
                    val.expand = false;
                    val.seeCurrentRank = false;
                    val.seeRecentRank = false;
                    val.taskTypeName = ['快速安装任务', '排重安装任务', '激活任务', '注册任务', '保排名任务'][val.taskType];
                    switch(+val.businessStatus) {
                        case -2:
                            val.businessStatus = '订单异常';
                        break;
                        case -1:
                            val.businessStatus = '交易失败';
                        break;
                        case 0:
                            val.businessStatus = '待支付';
                        break;
                        case 1:
                            val.businessStatus = '等待接单';
                        break;
                        case 2:
                            val.businessStatus = '渠道接单';
                        break;
                        case 3:
                            val.businessStatus = '开始执行';
                        break;
                        case 4:
                            val.businessStatus = '成功上传IDFA';
                        break;
                        case 5:
                            val.businessStatus = '交易成功';
                        break;
                        case 6:
                            val.businessStatus = '交易关闭';
                        break;
                        case 7:
                            val.businessStatus = '商家拒单';
                        break;
                        default:
                            val.businessStatus = '订单异常';
                        break;
                    }
                    val.btnDisabled = (val.taskType == 4 || (val.taskType !== 4 && val.businessStatus !== '交易成功'));
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
});