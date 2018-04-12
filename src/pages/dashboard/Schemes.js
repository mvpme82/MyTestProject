import React, { Component } from 'react';
import {observer} from "mobx-react";
import mobx, {extendObservable} from "mobx";
import Service from '../../service';
import config from '../../config';
import utils from '../../utils';
import KeywordList from '../../components/KeywordList';
import Loading from '../../components/Loading';
import { Accordion, Panel, ButtonGroup, Button } from 'react-bootstrap';
import MyPagination from '../../components/MyPagination';
import NoData from '../../components/NoData';

export default observer(class Minitors extends Component {
    constructor(props){
        super(props);
        extendObservable(this,{
            schemes: [],
            activePage: 1,
            totalPage: 0,
            initLoading: true
        });
        this.loadMySchemes(this.activePage);
    }
    render(){
        return (
            <div>
                <div className="aso-row aso-thead">
                    <div className="aso-thead-wrap">
                        <div className="text-center col-1">选词方案</div>
                        <div className="text-center col-3">订单号</div>
                        <div className="text-center col-2">词量</div>
                        <div className="text-center col-2">成交额</div>
                        <div className="text-center col-1">执行价</div>
                        <div className="text-center col-1">方案价</div>
                        <div className="text-right col-2" style={{paddingRight:25}}>操作</div>
                    </div>
                </div>
                {!this.initLoading && this.schemes.map((val, index) => {
                    return (
                        <div className="common-item-wrapper" key={`key-${index}`}>
                            <div className="common-item plan-item aso-row">
                                <div className="text-center col-1 plan-item__icon_tips plan-item__icon_tips_center">
                                    <img src={val.icon} width="70" height="70" className="plan-item__icon" alt=""/>
                                </div>
                                <div className="text-center col-3">
                                    <span className="plan-item__price plan-item__normal">{val.tradeNo}</span>
                                </div>
                                <div className="text-center col-2">
                                    <span className="plan-item__count plan-item__normal">{val.keywordCount}词</span>
                                </div>
                                <div className="text-center col-2">
                                    <span className="plan-item__price plan-item__normal">￥{(val.schemeTurnover / 10000).toFixed(1)}万</span>
                                </div>
                                <div className="text-center col-1">
                                    <span className="plan-item__price"><b>￥{ (val.totalFee / 10000).toFixed(1) }</b>万</span>
                                </div>
                                <div className="text-center col-1">
                                    <span className="plan-item__price"><b>￥{val.schemePrice}</b></span>
                                </div>
                                {val.isPay == 0 && (
                                    <div className="text-right col-2">
                                        <div className="btn-one btn-two">
                                            <Button  className="aso-style fixed-width-btn aso-style" style={{marginBottom: 3}} onClick={this.paySchemeDetail.bind(this, val)} bsStyle="primary">继续支付</Button>
                                            <Button className="aso-style fixed-width-btn aso-style--white" onClick={this.delSchemeDetail.bind(this, val.tradeNo)} bsStyle="primary">取消订单</Button>
                                        </div>
                                    </div>
                                )}
                                {val.isPay == 1 && (
                                    <div className="text-right col-2">
                                        <div className="btn-one">
                                            <Button className="aso-style fixed-width-btn aso-style--yellow" onClick={this.enterSchemeDetail.bind(this, val.schemeId)} bsStyle="primary">执行方案</Button>
                                        </div>
                                    </div>
                                )}
                                {val.isPay == 1 && (
                                    <span className="plan-item__dropdown" onClick={this.openSchemeKeywords.bind(this, val)}>详情</span>
                                )}
                            </div>
                            <Panel collapsible expanded={val.expand} className="aso-detail-panel">
                                <KeywordList data={val.keywordslist}/>
                                    {val.keywordslist.length >0 && (
                                        <div className="keyword-list__showall">
                                            <div className="HideBtn" onClick={this.openSchemeKeywords.bind(this, val)}>收起</div>
                                        </div>
                                    )}      
                            </Panel>  
                        </div>
                    )
                })}
                <Loading show={this.initLoading}/>
                <NoData show={!this.initLoading && !this.schemes.length}/>
                {this.totalPage > 1 && (
                    <MyPagination 
                        activePage={this.activePage} 
                        items={this.totalPage} 
                        onSelect={this.handleSelect.bind(this)}
                        prev={()=>{ this.handleSelect.bind(this, this.activePage - 1)() }}
                        next={()=>{ this.handleSelect.bind(this, this.activePage + 1)() }}/>
                )}
            </div>
        )
    }

    handleSelect(page){
        this.loadMySchemes(page);
    }
    /**
     * 继续支付
     * 
     * @param {Object} val 支付对象 
     */ 
    paySchemeDetail(val) {
        this.props.history.push({
            pathname:  `/schemepay/${val.schemeId}/${val.tradeNo}`,
            buyAgain: true,
            orderdetail: val
        });
    }
    /**
     * 取消订单
     * 
     * @param {number} id 支付id 
     */ 
    delSchemeDetail(id) {
        this.initLoading = true;
        Service.cancelOrder({
            tradeNo: id,
            order_type: 'scheme'
        }).then((res)=>{
            if (res.data.status === 200) {
                this.activePage = 1;
                this.loadMySchemes(this.activePage);
            }
        });
    }
    enterSchemeDetail(id){
        // 进入方案详情页 不携带应用信息
        this.props.history.push({
            pathname: '/schemedetail/' + id
        });
    }


    openSchemeKeywords(data){
        data.expand = !data.expand;
        if (data.expand && !data.loadKeywords) {
            Service.getSchemeKeywords(data.schemeId).then((res)=>{
                if (res.data.status === 200 && res.data.data) {
                    data.keywordslist = res.data.data;
                    data.loadKeywords = true;
                }
            });
        }
    }

    loadMySchemes(page){
        Service.getMyScheme({
            pageSize:20,
            currentPage: page
        }).then((res)=>{
            if (res.data.status === 200 && res.data.data) {
                this.totalPage = res.data.data.totalPage;
                this.activePage = res.data.data.pageNo;
                this.schemes = res.data.data.result.map((val)=>{
                    val.expand = false;
                    val.loadKeywords = false;
                    val.keywordslist = [];
                    val.type = val.type ? val.type : 0;
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