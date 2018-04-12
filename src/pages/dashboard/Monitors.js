import React, { Component } from 'react';
import {observer} from "mobx-react";
import mobx, {extendObservable} from "mobx";
import Service from '../../service';
import config from '../../config';
import utils from '../../utils';
import KeywordList from '../../components/KeywordList';
import RecentRank from '../../components/RecentRank';
import Remark from '../../components/Remark';
import CurrentRank from '../../components/CurrentRank';
import { Accordion, Panel, ButtonGroup, Button } from 'react-bootstrap';
import MyPagination from '../../components/MyPagination';
import Loading from '../../components/Loading';
import NoData from '../../components/NoData';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

var ReactToastr = require("react-toastr");
var {ToastContainer} = ReactToastr; // This is a React Element.
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

export default observer(class Minitors extends Component {
    constructor(props){
  	    super(props);
        extendObservable(this,{
            monitors: [],
            activePage: 1,
            totalPage: 0,
            currentDate: moment(),
            initLoading: true,
            isLoad: true,
            oldInfoIndex: -1,
            remarkIndex: -1
        });
        this.loadMyMonitors(this.activePage);
        utils.getRealTime().then((time)=>{
            this.currentDate = time;
        });
    }
    render() {
        return (
            <div>
                <div className="aso-thead aso-row">
                    <div className="aso-thead-wrap">
                        <div className="text-left col-3">应用</div>
                        <div className="text-center col-1">词量</div>
                        <div className="text-center col-2">目标排名</div>
                        <div className="text-center col-2">排期时间</div>
                        <div className="text-center col-1">创建时间</div>
                        <div className="text-center col-1">到榜率</div>
                        <div className="text-center col-1">当日排名</div>
                        <div className="text-center col-1">操作</div>
                    </div>
                </div>
                {this.monitors.map((val, index) => {
                    return (
                        <div className="common-item-wrapper common-item-wrapper-monitor common-item-wrapper-monitor-new" key={`key-${index}`}>
                            <div className="common-item plan-item dash-orders">
                                <div className="text-left col-3">
                                    <img src={val.icon} width="70" height="70" className="plan-item__icon pull-left img-text-fixed" alt=""/>
                                    <dl className="dash-appinfo dash-appinfo-new">
                                        <dt title={val.title} className="aso-trancate">{val.title}</dt>
                                        <dd title={val.appId} className="aso-trancate">{val.appId}</dd>
                                    </dl>
                                </div>
                                <div className="text-center col-1">
                                    {val.keywordsNum}
                                </div>
                                <div className="text-center col-2" title={val.tips}>
                                    {val.tips}
                                </div>
                                <div className="text-center col-2">
                                    {utils.formatTime(val.startDate,'MM-DD')}至{utils.formatTime(val.endDate,'MM-DD')}&nbsp;（{utils.days(val.startDate,val.endDate)}天）
                                </div>
                                <div className="text-center col-1">
                                    {moment(val.createTime).format('MM-DD')}&nbsp;
                                    {moment(val.createTime).format('HH:mm')}   
                                </div>
                                <div className="text-center col-1">
                                    <a className={"aso-aelem" + (val.expand && val.seeRecentRank ? " aso-aelem--active" : "")} onClick={this.seeRecentRank.bind(this, val)}>
                                        详情
                                        <i className="arrow"></i>
                                    </a>
                                </div>
                                <div className="text-center col-1">
                                    <a className={"aso-aelem" + (val.expand && val.seeCurrentRank ? " aso-aelem--active" : "")} onClick={this.seeCurrentRank.bind(this, val)}>
                                        详情
                                        <i className="arrow"></i>
                                    </a>  
                                </div>            
                                <div className="text-center col-1">
                                    <i title="再次添加" onClick={ this.createNewMonitor.bind(this,val) } className="aso-icon-add"></i>
                                    <i title="删除" onClick={this.deleteMonitor.bind(this,val)} className="aso-icon-remove"></i>
                                </div>

                                <div className={"text-left col-12 aso-trancate monitor-remark"} title={val.remarkNew.length ? val.remarkNew : '-'} onClick={this.seeCurrentRemark.bind(this, val, index)}>
                                    <span>备注：</span>
                                    {val.remarkNew.length ? val.remarkNew : '无'}
                                </div>
                            </div>
                            <Panel collapsible expanded={val.expand} className="aso-detail-panel">
                                {val.isChange && (
                                    <Remark  onSelect={(date) => {
                                        this.enterRemark(date, val);
                                }} type="monitor"  onClick={(data) => {
                                    if (data.action != 'cancel') {
                                        this.enterChangeInfo(this.remarkIndex, data.value);
                                    }
                                    else {
                                        val.expand = false;
                                    }
                                } } value={val.remarkNew}/>) }
                                {val.seeRecentRank && (
                                    <RecentRank  onSelect={(date) => {
                                        this.enterCurrentRank(date, val);
                                    }} onChange={(rank) => {
                                        val.arriveData = rank;
                                        this.updataArriveRank(val);
                                    }}
                                    type="monitor" rankLeavel={val.arriveData} orderType={val.taskType} entityId={val.monitorPlanId}/>) }
                                {val.seeCurrentRank && (<CurrentRank load={this.isLoad} index={index} rank={val.expectRank} date={this.currentDate} type="monitor" entityId={val.monitorPlanId}/>) }
                            </Panel>      
                        </div>
                    )
                })}
                <Loading show={this.initLoading}/>
                <NoData show={!this.initLoading && !this.monitors.length}/>
                {this.totalPage > 1 && (
                    <MyPagination 
                        activePage={this.activePage} 
                        items={this.totalPage} 
                        onSelect={this.handleSelect.bind(this)}
                        prev={()=>{ this.handleSelect.bind(this, this.activePage - 1)() }}
                        next={()=>{ this.handleSelect.bind(this, this.activePage + 1)() }}/>
                )}
                <ToastContainer ref="container"
	                        	toastMessageFactory={ToastMessageFactory}
	                        	className="toast-top-right" />
            </div>
        )
    }

    handleSelect(page){
        this.loadMyMonitors(page);
    }
    updataArriveRank(val) {
        Service.updateArrive({
            id: val.monitorPlanId,
            arriveData: val.arriveData
        }, 'aso').then((res)=>{
            // console.log(res.data);
        });
    }
    enterCurrentRank(date, val){
        this.currentDate = moment(date);
        this.seeCurrentRank(val);
    }
    enterChangeInfo(index, kw) {
        if (utils.getLength(kw) > 200) {
            this.refs.container.warning("", "备注不能超过100个汉字或200个字符", {
                timeOut: 3000,
                extendedTimeOut: 0,
                showAnimation: 'animated fadeInDown',
                hideAnimation: 'animated fadeOutUp',
            });
            return;
        }

        kw = kw.replace(/[\r\n]/g, ",");
        Service.updateRemark({
            asoMonitorPlanId: this.monitors[index].monitorPlanId,
            remark: kw
        }).then((res)=>{
            if (res.data.status === 200) {
                this.refs.container.success("", "修改成功", {
                    timeOut: 3000,
                    extendedTimeOut: 0,
                    showAnimation: 'animated fadeInDown',
                    hideAnimation: 'animated fadeOutUp',
                });
                this.monitors[index].remarkNew = kw;
                this.monitors[index].expand = false;
            }
            else {
                this.refs.container.warning("", "修改失败", {
                    timeOut: 3000,
                    extendedTimeOut: 0,
                    showAnimation: 'animated fadeInDown',
                    hideAnimation: 'animated fadeOutUp',
                });
            }
            this.monitors[index].isChange = false;
        });


        
    }

    seeCurrentRemark(val, index) {
        if (val.expand && val.isChange) {
            val.expand =  false;
        }
        else {
            val.expand = true;
        }
        val.isChange = true;
        val.seeRecentRank = false; 
        val.seeCurrentRank = false;
        this.remarkIndex = index;
    }
    seeCurrentRank(val){
        if (val.expand && val.seeCurrentRank) {
            val.expand =  false;
        }
        else {
            val.expand = true;
        }
        val.seeCurrentRank = true;
        val.seeRecentRank = false; 
        val.isChange = false;
    }
    seeRecentRank(val){
        if (val.expand && val.seeRecentRank) {
            val.expand =  false;
        }
        else {
            val.expand = true;
        }
        val.seeRecentRank = true;
        val.seeCurrentRank = false;
        val.isChange = false;
    }


    createNewMonitor(val){
        this.props.history.push({
            pathname: `/appdetail/${val.appId}/open/monitor`,
            openmonitor:true,
            monitordetail:{
                keywords:val.keywords.join(","),
                expectRank: val.expectRank,
                standard: val.standard,
                protectRate: val.protectRate,
                remark: val.remark
            }
        });
    }

    deleteMonitor(val){
        Service.deleteMonitor(val.monitorPlanId).then((res)=>{
            if (res.data.status === 200) {
                this.loadMyMonitors(this.activePage);
            }
        });
    }
    loadMyMonitors(page){
        Service.getMyMonitor({
            pageSize: 20,
            currentPage: page
        }).then((res)=>{
            if (res.data.status === 200 && res.data.data) {
                this.activePage = res.data.data.pageNo;
                this.totalPage = res.data.data.totalPage;
                this.monitors = res.data.data.result.map((val)=>{
                    val.remarkNew = val.remark.replace(/[\r\n]/g, " ");
                    val.expand = false;
                    val.seeCurrentRank = false;
                    val.seeRecentRank = false;
                    val.isChange = false;
                    val.tips =  config.expectRank[val.expectRank] + ' ' + config.standard[val.standard] + ' ' +  (val.protectRate == 4 ? '保' + val.protectRateValue + '% ' : config.protectRate[val.protectRate]);
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