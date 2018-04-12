/**
 * 开发者注:  此页面也可划分为 'ASO方案' '自助下单' '自助监控'三页，粒度更细，更易维护， 模式同管理中心
 *           由于时间有限，未做更改，后期维护的前端小伙伴可考虑重构
 **/
import React, { Component , PropTypes} from 'react';
import FilterAccordion from '../components/FilterAccordion';
import KeywordList from '../components/KeywordList';
import SegmentedControl from '../components/SegmentedControl';
import KeywordImport from '../components/KeywordImport';
import MyPagination from '../components/MyPagination';
import {observer} from "mobx-react";
import {extendObservable,computed,autorun} from "mobx";
import { Accordion, Panel, ButtonGroup, Pagination, Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import Service from '../service';
import DatePicker from 'react-datepicker';
import * as mobx from 'mobx';
import auth from '../auth';
import utils from '../utils';
import config from '../config';
import SortSpan from '../components/SortSpan';
import ChannelSelection from '../components/ChannelSelection';
import objectAssign from 'object-assign';
import _ from 'underscore';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import KeywordsEdit from '../components/KeywordsEdit';
import axios from 'axios';

// 引入登录弹框功能
import UserBase from '../components/UserBase';
import FormSelect from '../components/form-component/select';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
var ReactToastr = require("react-toastr");
var {ToastContainer} = ReactToastr; // This is a React Element.
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);


const PAGE_SIZE = 20;

class AsoTimeInput extends React.Component {
    render () {
        return (
            <FormControl
                className="input-caret"
                type="text"
                readOnly
                value={this.props.value}
                onChange={(evt)=>{this.props.value = evt.target.value}}
                onClick={this.props.onClick}
            />
        )
    }
}

AsoTimeInput.propTypes = {
    onClick: PropTypes.func,
    value: PropTypes.string
};



export default observer(class AppDetail extends Component {

    constructor(props){
        super(props);
        this.state = {
            FGtishi:false,
            JZtishi:false,
            initLoading:true,
            firsrCategory_id: 0,
            tabFlag: false
        }
        extendObservable(this,{
            filterCondition: [
                {
                    title: '词量',
                    key: 'keyword_count',
                    items: [{
                        name:'不限',
                        active: true
                    },{
                        name:'100词',
                        active: false,
                        value: 100
                    },{
                        name:'50词',
                        active: false,
                        value: 50
                    },{
                        name:'10词',
                        active: false,
                        value: 10
                    },{
                        name:'5词',
                        active: false,
                        value: 5
                    }]
                },
                {
                    title:'竞争程度',
                    key: 'competition',
                    items:[{
                        name:'不限',
                        active: true
                    },{
                        name:'强',
                        active: false,
                        value:2
                    },
                        {
                            name:'一般',
                            active: false,
                            value:1
                        },{
                            name:'弱',
                            active: false,
                            value:0
                        }]
                },
                {
                    title:'覆盖率',
                    key: 'cover_degree',
                    items:[{
                        name:'不限',
                        active: true
                    },{
                        name:'66%以上',
                        active: false,
                        value: 3
                    },
                    {
                        name:'33%-66%',
                        active: false,
                        value: 2
                    },{
                        name:'33%以下',
                        active: false,
                        value: 1
                    }]
                }
            ],
            appdetail: {},
            schemes: [],
            currentTab: 0,
            monitorData:{
                startDate: moment(),
                endDate: moment().add(1,'day'),
                remark: "",
                protectRate: 2,
                standard: 1,
                expectRank: 3,
                keywords: ""
            },
            orderData: {
                keywords: "",
                expectRank: 3
            },
            activePage: 1,
            totalPage: 0,
            error: {
                monitorRemark: false,
                monitorKeyword: false,
                orderKeyword: false,
                hasUselessKeywords: false
            },

            // 校验自助下单是否符合排名规范
            rankError: {
                order: [],
                loading: false
            },

            hasEmpty: false,
            monitorSubmit: false,
            orderSubmit: false,
            creating: false, //正在创建

            channels: [], //渠道商

            currentFilterParams: {},

            initLoading: true,

            sortKey: "keyword_count",
            sortOrder: {
                keyword_count: 0,
                competition: 0,
                cover_degree: 0,
                scheme_turnover: 0,
                total_fee: 0,
                scheme_price: 0
            },

            activateSort: false, //是否要激活排序

            sortedSchemes: computed(()=>{
                return _.sortBy(this.schemes, (val)=>{
                    return !val.purchased;
                });
                // if (!this.activateSort) {
                //   return this.schemes;
                // }

                // return this.schemes.sort((val1, val2)=>{
                //   if (this.sortOrder) {
                //     return val1[this.sortKey] - val2[this.sortKey];
                //   } else {
                //     return val2[this.sortKey] - val1[this.sortKey];
                //   }
                // });
            }),
            baseModalShow: false,
            redirectUri: '',
            redirectId: 0,
            redirectType: 'order',
            redirectData: {},
            redirectMonitorData: {},
            isActive: false
        });



        if (this.props.location.openmonitor || (this.props.match.params.type && this.props.match.params.type == 'monitor')) { // 打开自助监控
            this.currentTab = 2;
            objectAssign(this.monitorData, this.props.location.monitordetail);
        }

        if (this.props.location.openorder|| (this.props.match.params.type && this.props.match.params.type == 'order')) { // 打开自助下单
            this.currentTab = 1;
            objectAssign(this.orderData, this.props.location.orderdetail);
        }

        if (window.location.hash == '#order') {
            this.currentTab = 1;
        }
        if (window.location.hash == '#schema') {
            this.currentTab = 0;
        }        
        if (window.location.hash == '#monitor') {
            this.currentTab = 2;
        }

        // 获取服务器
        utils.getRealTime().then((time)=>{
            this.monitorData.startDate = time;
            this.formatEndDate();
        });
    }

    formatEndDate(){
        let fstart = +moment(this.monitorData.startDate.format('YYYY-MM-DD'));
        let fend = +moment(this.monitorData.endDate.format('YYYY-MM-DD'));
        if (fstart >= fend) {
            this.monitorData.endDate = moment(fstart).add(1,'day');
        }
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
                        <div className="pull-right">
                            <SegmentedControl items={['ASO方案','自助下单','自助监控']} default={this.currentTab} onSelected={this.switchTab.bind(this)}/>
                        </div>
                    </div>
                    {this.currentTab === 0 && this.renderSchemes()}
                    {this.currentTab === 1 && this.renderSelfOrder()}
                    {this.currentTab === 2 && this.renderSelfMonitor()}

                    <ToastContainer ref="container"
                        toastMessageFactory={ToastMessageFactory}
                        className="toast-top-right" />
                </section>
                <UserBase redirectUri = {this.redirectUri} hide={()=>{
                    this.baseModalShow = false;
                    this.isActive = false;
                }} showType = "login" showModal = {this.baseModalShow} onChange={(data)=>{
                    // 判断这个id是否购买 15210098243 or 13401128875 sdaujsjzcc@163.com 123456 
                    this.isActive = false;
                    if (this.redirectType === 'aso') {
                        Service.isBuyCase({
                            schemeId: this.redirectId
                        }).then((res)=>{
                            // 未购买
                            if (res.data.status == 200 && !res.data.data) {
                                // 跳转到购买页
                                window.location.href =  this.redirectUri;
                            }
                            else {
                                window.location.reload();
                            }
                        }).catch(()=>{
                            window.location.reload();
                        });
                    }
                    else if (this.redirectType === 'monitor') {
                        this.beginMonitor(this.redirectMonitorData);
                    }
                    else {
                        if (this.redirectUri && this.redirectUri !== '') {
                            window.location.href =  this.redirectUri;
                        }
                        else {
                            this.createOptimize(this.redirectData);
                        }
                    }
                }}/>
            </div>
        );
    }


    switchTab(idx){
        this.currentTab = idx;
        this.props.history.push({
            openfrom: idx
        });
        if (idx == 0){
            window.location.hash = "schema";
        }
        if (idx == 1){
            window.location.hash = "order";
        }
        if (idx == 2){
            window.location.hash = "monitor";
        }
    }
    changeSortKey(key, order){
        this.sortOrder =  {
            keyword_count: 0,
            competition: 0,
            cover_degree: 0,
            scheme_turnover: 0,
            total_fee: 0,
            scheme_price: 0
        };
        this.sortKey = key;
        this.sortOrder[key] = order;
        this.activateSort = true;
        this.activePage = 1;
        this.loadScheme(objectAssign({
            app_id: this.props.match.params.appId,
            pageSize: PAGE_SIZE,
            currentPage: this.activePage
        },this.currentFilterParams));
    }
    renderSchemes(){
        return (
            <div>
                <FilterAccordion condition={this.filterCondition} tabClick={this.state.tabFlag} onSelected={this.filterSelected.bind(this)}/>
                <div className="aso-row aso-thead">
                    <div className="aso-thead-wrap">
                        <div className="text-left col-2">
                            <span className="text-center w70">选词方案</span>
                        </div>
                        <div className="text-center col-1">
                            <SortSpan  reverse={this.sortOrder.keyword_count} onChange={(status)=>{this.changeSortKey("keyword_count", status)}} title="词量"/>
                        </div>
                        <div className="text-center col-2">
                            竞争程度
                            <i className="aso-icon-wenhao"  onMouseOver={()=>{
                                this.setState({
                                    JZtishi:true
                                })
                            }} onMouseOut={()=>{
                                    this.setState({
                                        JZtishi:false
                                    })
                            }} >
                                <span className={this.state.JZtishi?'PromptMsg showTishi':'PromptMsg hideTishi'} >
                                    应用在某些关键词下与其他竞品竞争的激烈程度
                                    <span className="triangle-down"></span>
                                </span>
                            </i>
                            <SortSpan reverse={this.sortOrder.competition} onChange={(status)=>{this.changeSortKey("competition", status)}} title=""/>
                        </div>
                        <div className="text-center col-1">
                            覆盖率
                            <i className="aso-icon-wenhao"  onMouseOver={()=>{
                                this.setState({
                                    FGtishi: true
                                })
                            }} onMouseOut={()=>{
                                this.setState({
                                    FGtishi:false
                                })
                            }} >
                                <span className={this.state.FGtishi ? 'PromptMsg showTishi' : 'PromptMsg hideTishi'}>
                                    关键词搜索结果中有该app的关键词数量/关键词总数
                                    <span className="triangle-down"></span>
                                </span>
                            </i>
                            <SortSpan reverse={this.sortOrder.cover_degree} onChange={(status)=>{this.changeSortKey("cover_degree", status)}} title=""/>
                        </div>
                        <div className="text-center col-2">
                            <SortSpan reverse={this.sortOrder.scheme_turnover} onChange={(status)=>{this.changeSortKey("scheme_turnover", status)}} title="成交额"/>
                        </div>
                        <div className="text-center col-1">
                            <SortSpan reverse={this.sortOrder.total_fee} onChange={(status)=>{this.changeSortKey("total_fee", status)}} title="执行价"/>
                        </div>
                        <div className="text-right col-1" style={{paddingRight:5}}>
                            <SortSpan reverse={this.sortOrder.scheme_price}  onChange={(status)=>{this.changeSortKey("scheme_price", status)}} title="方案价"/>
                        </div>
                        <div className="text-right col-2" style={{paddingRight:25}}>操作</div>
                    </div>
                </div>
                {this.sortedSchemes.map((data, index) => {return (
                    <div className="common-item-wrapper" key={`key-${index}`}>
                        <div className="common-item aso-row">
                            <div className="text-left col-2 plan-item__icon_tips">
                                <img src={data.icon} width="70" height="70" className="plan-item__icon" alt=""/>
                            </div>
                            <div className="text-center col-1">
                                <span><b>{data.keyword_count}</b>词</span>
                            </div>
                            <div className="text-center col-2">
                                <span>{config.competition[data.competition]}</span>
                            </div>
                            <div className="text-center col-1">
                                <span>{data.cover_degree}%</span>
                            </div>
                            <div className="text-center col-2">
                                <span >￥{(data.scheme_turnover/10000).toFixed(1)}万</span>
                            </div>
                            <div className="text-center col-1">
                                <span className="plan-item__price"><b>￥{ (data.total_fee / 10000).toFixed(1) }</b>万</span>
                            </div>
                            <div className="text-right col-1" style={{paddingRight:5}}>
                                <span className="plan-item__price">￥{data.scheme_price}</span>
                            </div>
                            <div className="text-right col-2">
                                {data.purchased ? (<Button className="aso-style fixed-width-btn aso-style--yellow" onClick={this.seeChannelDetail.bind(this,data)} bsStyle="primary">执行方案</Button>) : (<Button className="aso-style fixed-width-btn" onClick={this.purchaseScheme.bind(this,data)} bsStyle="primary">购买方案</Button>)}
                            </div>
                            {data.purchased && (<span onClick={ this.seeKeywordDetail.bind(this, data) } className="plan-item__dropdown">详情</span>) }

                        </div>
                        <Panel collapsible expanded={data.expand} className="aso-detail-panel">
                            { data.seeKeywordDetail && this.renderKeywordList(data) }
                            { data.seeChannelDetail && this.renderOptimizeOrder(data) }
                        </Panel>
                    </div>
                )})}
                <Loading show={this.state.initLoading}/>
                <NoData show={!this.state.initLoading&&this.sortedSchemes.length==0}/>
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
        );
    }

    renderKeywordList(data){
        if (!data.loadKeywords) {
            data.loadKeywords = true;
            Service.getSchemeKeywords(data.id, data.app_id).then((res)=>{
                if (res.data.status === 200 && res.data.data) {
                    data.keywordslist = res.data.data;
                }
            });
        }

        return (
            <div>
                <KeywordList  data={data.keywordslist}/>
                { data.keywordslist.length > 0 && (
                    <div className="keyword-list__showall">
                        <div className="HideBtn" onClick={this.seeKeywordDetail.bind(this,data)}>收起</div>
                    </div>
                )}
            </div>
        )
    }

    renderOptimizeOrder(data){
        return (
            <div style={{padding:20}}>
                <ChannelSelection schemeId={data.id} active={this.isActive} loading="true" hideTime="true" appId={this.props.match.params.appId} keywords={data.keywords} onSelect={(data)=>{
                    this.isActive = true;
                    this.createOptimize(data);
                    {/* window.open(`${window.location.origin}/optimizepay/${this.formatOrderParams(data)}/0`); */}
                }}/>
            </div>
        )
    }
    createOptimize(data){
        data.week = 7;
        data.keywords = utils.joinValid(data.keywords);
		Service.createOptimize(data).then((res)=>{
			if (res.data.status === 200 && res.data.data) {
                let tradeNo = res.data.data.tradeNo;
                window.location.href = `${window.location.origin}/optimizepay/${this.formatOrderParams(data)}/${tradeNo}`;
            }
            this.isActive = false;
		}).catch((thrown) => {
            this.isActive = false;
        });
	}
    formatOrderParams(data){
        var {optimizeDatetime, taskType, channelId, expectRank, appId, keywords, schemeId} = data;
        keywords = utils.joinValid(keywords);
        return `${appId}/${schemeId}/${taskType}/${channelId}/${expectRank}/${optimizeDatetime}`;
        // return `${appId}/${schemeId}/${taskType}/${channelId}/${expectRank}/${optimizeDatetime}/${keywords}`
    }

    // 切换详情展示
    seeChannelDetail(val, e){
        if (val.expand && val.seeKeywordDetail) {
        } else {
            val.expand = !val.expand;
        }
        val.seeChannelDetail = true;
        val.seeKeywordDetail = false;
        e.preventDefault();
        e.stopPropagation();
    }

    seeKeywordDetail(val){
        if (val.expand && val.seeChannelDetail) {
        } else {
            val.expand = !val.expand;
        }
        val.seeKeywordDetail = true;
        val.seeChannelDetail = false;
    }



    handleSelect(page){
        this.loadScheme(objectAssign({
            app_id: this.props.match.params.appId,
            pageSize: PAGE_SIZE,
            currentPage: page
        },this.currentFilterParams));
    }

    enterSchemeDetail(data){
        this.props.history.push({
            pathname: `/schemedetail/${data.id}`,
            appdetail: this.appdetail
        })
    }


    renderSelfOrder(){
        return (
            <div>
                {this.renderKeywordsTextarea(this.orderData, 'orderKeyword', this.orderSubmit)}
                <ChannelSelection rankLoad={this.rankError.loading} rankError={this.rankError.order} loading="true" active={this.isActive}  showExtra={true} showExtraLeft='28%' initRank={this.orderData.expectRank}  hideTime="true" appId={this.props.match.params.appId} keywords={this.orderData.keywords} onSelect={(data)=>{
                    this.orderSubmit = true;
                    this.isActive = true;
                    if (!utils.checkIsValidNew(this.orderData.keywords)) {
                        this.isActive = false;
                        return;
                    }
                    data.keywords = utils.formatKeywords(data.keywords);
                    auth.checkStatus().then((isLogin)=>{
                        if (isLogin) {
                            this.createOptimize(data);
                            {/* window.open(`${window.location.origin}/optimizepay/${this.formatOrderParams(data)}/0`); */}
                        }
                        else {
                            this.baseModalShow = true;
                            this.redirectType = 'order';
                            this.redirectData = data;
                            {/* this.redirectUri = `${window.location.origin}/optimizepay/${this.formatOrderParams(data)}/0`; */}
                        }
                    });
                }}/>
            </div>);
    }

    renderSelfMonitor(){

        return (
            <div>
                {this.renderKeywordsTextarea(this.monitorData, 'monitorKeyword', this.monitorSubmit)}
                <div className="aso-row">
                    <div className="col-6">
                        <FormGroup className="aso-formgroup">
                            <ControlLabel>开始时间</ControlLabel>
                            <DatePicker
                                fixedHeight={true}
                                dateFormat="YYYY-MM-DD"
                                selected={this.monitorData.startDate}
                                onChange={(date)=>{
                                    this.monitorData.startDate = date;
                                    let fstart = +moment(this.monitorData.startDate.format('YYYY-MM-DD'));
                                    let fend = +moment(this.monitorData.endDate.format('YYYY-MM-DD'));
                                    if (fstart >= fend) {
                                        this.monitorData.endDate = moment(fstart).add(1,'day');
                                    }
                                }}
                                customInput={<AsoTimeInput />} 
                            />
                        </FormGroup>
                    </div>
                    <div className="col-6 aso-padding-l">
                        <FormGroup className="aso-formgroup">
                            <ControlLabel>预计结束时间</ControlLabel>
                            <DatePicker
                                fixedHeight={true}
                                minDate={+moment(this.monitorData.startDate.format('YYYY-MM-DD')) < +moment(moment().format('YYYY-MM-DD')) ? moment() : moment(this.monitorData.startDate).add(1,'day')}
                                dateFormat="YYYY-MM-DD"
                                selected={this.monitorData.endDate}
                                onChange={(date)=>{this.monitorData.endDate = date}}
                                customInput={<AsoTimeInput />}/>
                        </FormGroup>
                    </div>
                </div>
                <div className="aso-row">
                    <div className="col-3">
                        <FormGroup className="aso-formgroup">
                            <ControlLabel>目标排名</ControlLabel>
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
                            }]} value={this.monitorData.expectRank} onChange={(evt) => {
                                this.monitorData.expectRank = evt.select;
                            }}></FormSelect>
                        </FormGroup>
                    </div>
                    <div className="col-3 aso-padding-l">
                        <FormGroup className="aso-formgroup">
                            <ControlLabel>&nbsp;</ControlLabel>
                            <FormSelect type="top" data={[{
                                index: 1,
                                value: '不降档'
                            }, {
                                index: 2,
                                value: '降档'
                            }, {
                                index: 3,
                                value: '必保排名'
                            }]} value={this.monitorData.standard} onChange={(evt) => {
                                this.monitorData.standard = evt.select;
                            }}></FormSelect>
                        </FormGroup>
                    </div>
                    <div className="col-6 aso-padding-l">
                        <FormGroup className="aso-formgroup">
                            <ControlLabel>上榜率</ControlLabel>
                            <FormSelect type="top" data={[{
                                index: 1,
                                value: '保100%'
                            }, {
                                index: 2,
                                value: '保70%'
                            }, {
                                index: 3,
                                value: '上多少算多少'
                            }]} value={this.monitorData.protectRate} onChange={(evt) => {
                                this.monitorData.protectRate = evt.select;
                            }}></FormSelect>
                        </FormGroup>
                    </div>
                </div>
                <FormGroup className="aso-formgroup">
                    <ControlLabel>备注</ControlLabel>
                    <FormControl value={this.monitorData.remark} onChange={(evt)=>{
                        let val = evt.target.value.trim(); //去除空格检查
                        if (utils.getLength(val) > 200) {
                            this.error.monitorRemark = true;
                        } else {
                            this.error.monitorRemark = false;
                        }
                        this.monitorData.remark = evt.target.value;
                    }}
                        componentClass="textarea" rows="4" placeholder="如：20词保70% top3一周，执行渠道增哥优化，价格9万，已付全款" />
                    {this.error.monitorRemark && (<div className="aso-error">备注不能超过100个汉字或200个字符</div>) }
                </FormGroup>

                <Button onClick={this.startMonitor.bind(this)} disabled={this.creating} bsClass="btn" bsStyle="primary" className="aso-style">{this.creating ? '创建中...' : '开始监控'}</Button>
            </div>
        );
    }


    renderKeywordsTextarea(data, errorKey, submitError){
        return (
            this.appdetail.appId && (
                <FormGroup className="aso-formgroup">
                    <ControlLabel>{errorKey === 'orderKeyword' ? "请填写您想要优化的关键词" : "添加关键词"}</ControlLabel>
                    <KeywordsEdit
                        value={data.keywords}
                        showerror={errorKey === 'orderKeyword' ? 1 : 0}
                        ref={(ke) => { this._ke = ke; }}
                        onFocus={(evt, value)=>{
                            this.rankError.loading = true;
                        }}
                        onChange={(evt, value)=>{
                            data.keywords = value;                     
                            // 是否符合规则
                            {/* if (utils.checkKeywordLength(data.keywords)) { 
                                this.error[errorKey] = false;
                            } else {
                                this.error[errorKey] = true;
                            } */}
                            this.rankError.loading = true;
                            this.error[errorKey] = false;
                            if (!value) {
                                this.rankError.order = [];
                            }
                        }}
                        onBlur={(evt, value)=>{
                            data.keywords = value;
                            this.rankError.order = [];
                            if (value) {
                                if (value.indexOf(' ') > -1) {
                                    this.hasEmpty = true;
                                } 
                                else {
                                    this.hasEmpty = false;
                                }
                                if (errorKey === 'orderKeyword') {
                                    Service.getKeywordRank({
                                        appId: this.appdetail.appId,
                                        keywords: data.keywords
                                    }).then((res)=>{
                                        if (res.data.status === 200) {
                                            var error = [];
                                            for (var i in res.data.data) {
                                                if (res.data.data[i] == '-'){
                                                    error.push(i); 
                                                }
                                                if (res.data.data[i] != '-' && res.data.data[i] <= 200){
                                                    this.rankError.order.push(i);
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
                                        setTimeout(() => {
                                            this.rankError.loading = false;
                                        }, 1000);
                                    });
                                }
                            }
                            else {
                                this.error.hasUselessKeywords = false;
                                this.rankError.loading = false;
                            }
                        }}
                        placeholder="输入一个或多个关键词，使用逗号、顿号、分号或换行分隔"
                    />
                    <KeywordImport onImported={(keywords)=>{
                        let oldkeywords = data.keywords,
                            len = oldkeywords.length;
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
                        {/* if (utils.checkKeywordLength(data.keywords)) { 
                            this.error[errorKey] = false;
                        }
                        else {
                            this.error[errorKey] = true;
                        } */}
                        this.error[errorKey] = false;
                        this.rankError.loading = false;
                        this._ke.init(data.keywords);
                    }}/>
                    {errorKey === 'orderKeyword' && this.error.hasUselessKeywords && (
                        <a className="keyword-import-btn" onClick={(evt) => {
                            this._ke.cleanError();
                            this.error.hasUselessKeywords = false;
                            this.rankError.order = [];
                            this.rankError.loading = false;
                        }}>清空无效关键词</a>
                    )}

                    {this.error[errorKey] && (<div className="aso-error pull-right">关键词不能超16个汉字或32个字符</div>) }
                    {this.hasEmpty && (<div className="aso-error aso-error-black pull-right">如需填写带空格的关键词，请在下一步继续添加</div>) }
                    {submitError && (!utils.checkIsValidNew(data.keywords)) && !this.error[errorKey] && (<div className="aso-error pull-right">请输入正确的关键词</div>)}
                </FormGroup>
            )
        )
    }


    componentDidMount(){
        let appId = this.props.match.params.appId;
        this.loadAppInfo(appId); //获取应用信息
    }

    loadCategories(){
        Service.getSchemeCategory().then((res)=>{
            if (res.data.status === 200 && res.data.data) {
            this.filterCondition = [];
            this.filterCondition = [{
                title: '类型',
                key: 'category_id',
                items: [{
                    name:'不限',
                    active: false
                }].concat(res.data.data.map((val) => {
                    val.name = val.category_name;
                    val.active = false;
                    if(this.appdetail.categoryId===val.category_id){
                        val.active = true;
                    }
                    val.value = val.category_id;
                    return val;
                }))
            },
            {
                title: '词量',
                    key: 'keyword_count',
                    items: [{
                    name:'不限',
                    active: true
                },{
                    name:'100词',
                    active: false,
                    value: 100
                },{
                    name:'50词',
                    active: false,
                    value: 50
                },{
                    name:'10词',
                    active: false,
                    value: 10
                },{
                    name:'5词',
                    active: false,
                    value: 5
                }]
                },
                {
                    title:'竞争程度',
                        key: 'competition',
                    items:[{
                    name:'不限',
                    active: true
                },{
                    name:'强',
                    active: false,
                    value:2
                },
                    {
                        name:'一般',
                        active: false,
                        value:1
                    },{
                        name:'弱',
                        active: false,
                        value:0
                    }]
                },
                {
                    title:'覆盖率',
                    key: 'cover_degree',
                    items:[{
                        name:'不限',
                        active: true
                    },{
                        name:'66%以上',
                        active: false,
                        value: 3
                    },
                    {
                        name:'33%-66%',
                        active: false,
                        value: 2
                    },{
                        name:'33%以下',
                        active: false,
                        value: 1
                    }]
                }];
            }
        });
    }
    purchaseScheme(data){
        auth.checkStatus().then((isLogin)=>{
            if (isLogin) {
                window.open(`${window.location.origin}/schemepay/${data.id}-${data.app_id}/0`);
            }
            else {
                this.baseModalShow = true;
                this.redirectId = data.id;
                this.redirectType = 'aso';
                this.redirectUri = `${window.location.origin}/schemepay/${data.id}-${data.app_id}/0`;
            }
        });
    }


    /*获取aso方案*/
    loadScheme(params) {
        let sort = '';
        switch(+this.sortOrder[this.sortKey]) {
            case 0:
                sort = '';
            break;
            case 1:
                sort = this.sortKey + ',asc';
            break;
            case 2:
                sort = this.sortKey + ',desc';
            break;
        }
        params.order_by_info = sort;

        var lis = document.querySelectorAll('.aso-filter-item li');
        for(var i = 0; i < lis.length ; i++){
            lis[i].setAttribute('disabled', 'disabled');
        }
        setTimeout(() => {
            Service.listScheme(params).then((response) => {
                if (response.data.status === 200 && response.data.data) {
                    this.setState({
                        initLoading:false,
                        tabFlag: false
                    });
                    let entity = response.data.data;
                    this.totalPage = entity.totalPage;
                    this.activePage = entity.pageNo;
                    this.schemes = entity.result.map((val)=>{
                        val.expand = false;
                        val.keywordslist = [];
                        val.loadKeywords = false;
                        val.seeChannelDetail = false;
                        val.seeKeywordDetail = false;

                        // 从方案详情页进来 不需要去展开了相应的scheme了
                        // if (this.props.location.schemeId && Number(this.props.location.schemeId) === val.id) {
                        //   val.expand = true;
                        //   val.seeChannelDetail = true;
                        // }

                        return val;
                    });
                    window.scrollTo(0, 0);
                    setTimeout(() => {
                        for(var i = 0; i < lis.length ; i++){
                            lis[i].removeAttribute('disabled');
                        }
                    }, 10);
                }
            }).catch((thrown) => {
                if (axios.isCancel(thrown)) {
                    console.log("取消", params.category_id);
                }
                this.setState({
                    initLoading:false,
                    tabFlag: false
                });
                for(var i = 0; i < lis.length ; i++){
                    lis[i].removeAttribute('disabled');
                }
            });
        }, 20);
    }


    loadAppInfo(appId){
        Service.getAppInfo(appId).then((res)=>{
            if (res.data.status === 200) {
                this.appdetail = res.data.data;
                this.loadCategories();
                if (this.appdetail && this.appdetail.categoryId) {
                    this.currentFilterParams = {
                        category_id: this.appdetail.categoryId
                    }
                }
                this.loadScheme(objectAssign({
                    app_id: appId,
                    pageSize: PAGE_SIZE,
                    currentPage: this.activePage,
                },this.currentFilterParams));
            }
        });
    }

    filterSelected(value){
        this.setState({
            initLoading:true,
            tabFlag: true
        });
        this.schemes = [];
        this.totalPage = 0;

        let params = {};
        value.forEach((val, index)=>{
            if (val.name !== '不限') {
                params[this.filterCondition[index].key] = val.value;
            }
        });
        this.currentFilterParams = params;

        this.loadScheme(objectAssign({
            app_id: this.props.match.params.appId,
            pageSize: PAGE_SIZE,
            currentPage: 1
        },this.currentFilterParams));
    }


    startMonitor(){
        this.monitorSubmit = true;
        if (this.error.monitorRemark || this.error.monitorKeyword || !utils.checkIsValidNew(this.monitorData.keywords))  return;
        // 需要登录
        let monitorData = mobx.toJS(this.monitorData);

        monitorData.keywords = utils.formatKeywords(monitorData.keywords);
        monitorData.remark = monitorData.remark.trim();
        monitorData.appId = this.props.match.params.appId;
        monitorData.standard = Number(monitorData.standard);
        monitorData.expectRank = Number(monitorData.expectRank);
        monitorData.protectRate = Number(monitorData.protectRate);
        monitorData.startDate = monitorData.startDate.format('YYYY-MM-DD');
        monitorData.endDate = monitorData.endDate.format('YYYY-MM-DD');
        
        auth.checkStatus().then((isLogin)=>{
            if (isLogin) {
                this.beginMonitor(monitorData);
            }
            else {
                this.baseModalShow = true;
                this.redirectType = 'monitor';
                this.redirectUri = '';
                this.redirectMonitorData = monitorData;
            }
        });
    }

    beginMonitor(monitorData) {
        this.creating = true;
        Service.createMonitor(monitorData).then((res)=>{
            if (res.data.status === 200) {
                this.props.history.push('/dashboard/monitors');
            }
            this.creating = false;
        }).catch(()=>{
            this.creating = false;
        })
    }
});
