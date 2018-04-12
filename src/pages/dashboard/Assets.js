import React, { Component } from 'react';
import {observer} from "mobx-react";
import mobx, {extendObservable} from "mobx";
import Service from '../../service';
import config from '../../config';
import utils from '../../utils';
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
            myAsset: {},
            asstesLog: [],
            activePage: 1,
            totalPage: 0,
            currentDate: moment(),
            initLoading: false
        });
        this.loadMyAssets();
        this.loadMyAssetsLog(this.activePage);
    }

    render() {
        return (
            <div>
                <div className="common-item-wrapper common-my-item-wrapper clearfix">
                    <div className="aso-row ">
                        <div className="col-4 common-item">
                            <i className="icon icon-user"> </i>
                            <span className="common-my-item-title">账号</span>
                            <span className="common-my-item-desc" title={this.myAsset.userName}>{this.myAsset.userName}</span>
                        </div>
                        <div className="col-4 common-item">
                            <i className="icon icon-wallet"> </i>
                            <span className="common-my-item-title">账户余额</span>
                            <span className="common-my-item-desc">
                                {this.myAsset.amount}<em> 元</em>
                                <a href="http://wpa.qq.com/msgrd?v=3&uin=3277439952&site=qq&menu=yes"  className="pull-right" target="_blank">申请发票</a>
                                <a href={`${window.location.origin}/recharge`}  className="pull-right" style={{marginRight: 10}}>充值</a>
                            </span>
                        </div>
                        <div className="col-4 common-item common-item-last">
                            <i className="icon icon-assurance"> </i>
                            <span className="common-my-item-title">担保收益</span>
                            <span className="common-my-item-desc">
                                {this.myAsset.assuranceAmount}<em> 元</em>
                                <a href="http://wpa.qq.com/msgrd?v=3&uin=3277439952&site=qq&menu=yes"  className="pull-right" target="_blank">提现</a>
                            </span>
                        </div>
                        {/* <div className="col-4 common-item common-item-last">
                            <i className="icon icon-mall"> </i>
                            <span className="common-my-item-title">发票管理</span>
                            <span className="common-my-item-desc">
                                <a href="http://wpa.qq.com/msgrd?v=3&uin=3277439952&site=qq&menu=yes" style={{marginRight: 20}} className="pull-left" target="_blank">开具发票</a>
                                <a href="http://wpa.qq.com/msgrd?v=3&uin=3277439952&site=qq&menu=yes"  className="pull-left" target="_blank">发票记录</a>
                            </span>
                        </div> */}
                    </div>
                </div>
                <div className="aso-thead aso-row">
                    <div className="aso-thead-wrap">
                        <div className="col-1" style={{height: 44}}></div>
                        <div className="text-left col-2">名称</div>
                        <div className="text-center col-7">日期</div>
                        <div className="text-center col-2">明细</div>
                    </div>
                </div>

                {
                    this.asstesLog.map((val, key)=>{
                        return (
                            <div className="common-item-wrapper" key={key}>
                                <div className="common-item plan-item dash-orders">
                                    <div className="col-1" style={{height: '100%'}}></div>
                                    <div className="text-left col-2">
                                        <div className="two-rows">
                                            <span className="two-rows-title" title={val.name}>{val.name}</span>
                                            <span className="two-rows-thin-title" title={val.remark}>{val.remark}</span>
                                        </div>
                                    </div>
                                    <div className="text-center col-7">
                                        <div className="two-rows">
                                            <span className="two-rows-title">{moment(val.create_time).format('MM-DD')}</span>
                                            <span className="two-rows-title">{moment(val.create_time).format('HH:mm')}</span>
                                        </div>
                                    </div>
                                    <div className="text-center col-2">{val.money}</div>
                                </div>
                            </div>
                        )
                    })
                }
                <Loading show={this.initLoading}/>
                <NoData show={!this.initLoading && !this.asstesLog.length}/>
                {this.totalPage > 1 && (
                    <MyPagination
                        activePage={this.activePage}
                        items={this.totalPage}
                        onSelect={this.handleSelect.bind(this)}
                        prev={()=>{ this.handleSelect.bind(this, this.activePage - 1)() }}
                        next={()=>{ this.handleSelect.bind(this, this.activePage + 1)() }}
                    />
                )}
            </div>
        )
    }
    handleSelect(page){
        this.loadMyAssetsLog(page);
    }
    loadMyAssets(){
        Service.getMyAssets({}).then((res)=>{
            if (res.data.status === 200 && res.data.data) {
                this.myAsset = res.data.data;
            }
        }).catch(()=>{

        })
    }
    loadMyAssetsLog(page){
        Service.getMyAssetsLog({
            pageSize: 20,
            currentPage: page
        }).then((res)=>{
            if (res.data.status === 200 && res.data.data) {
                this.activePage = res.data.data.pageNo;
                this.totalPage = res.data.data.totalPage;
                // res.data.data.result = [{
                //     "id": 1,
                //     "user_id": 5000089,
                //     "name": "充值",
                //     "money": 10000.0,
                //     "remark": "充值10000元充值10000元充值10000元",
                //     "create_time": 1502762376000,
                //     "update_time": 1502765311000,
                //     "status": 0
                //   }, {
                //     "id": 1,
                //     "user_id": 5000089,
                //     "name": "充值",
                //     "money": 10000.0,
                //     "remark": "充值10000元充值10000元充值10000元",
                //     "create_time": 1502762376000,
                //     "update_time": 1502765311000,
                //     "status": 0
                //   }, {
                //     "id": 1,
                //     "user_id": 5000089,
                //     "name": "充值",
                //     "money": 10000.0,
                //     "remark": "充值10000元充值10000元充值10000元",
                //     "create_time": 1502762376000,
                //     "update_time": 1502765311000,
                //     "status": 0
                //   },{
                //     "id": 1,
                //     "user_id": 5000089,
                //     "name": "充值",
                //     "money": 10000.0,
                //     "remark": "充值10000元充值10000元充值10000元",
                //     "create_time": 1502762376000,
                //     "update_time": 1502765311000,
                //     "status": 0
                //   }];
                this.asstesLog = res.data.data.result;
            }
            window.scrollTo(0, 0);
            this.initLoading = false;
        }).catch(()=>{
            this.initLoading = false;
        })
    }
});