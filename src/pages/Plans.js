import React, { Component } from 'react';
import FilterAccordion from '../components/FilterAccordion';
import {observer} from "mobx-react";
import {extendObservable,computed,autorun} from "mobx";
import { Accordion, Panel, Button } from 'react-bootstrap';
import Service from '../service';
import Common from '../common';
import MyPagination from '../components/MyPagination';
import KeywordList from '../components/KeywordList';
import SortSpan from '../components/SortSpan';
import objectAssign from 'object-assign';
import _ from 'underscore';
import auth from '../auth';
import Loading from '../components/Loading';
import NoData from '../components/NoData';

import UserBase from '../components/UserBase';

const PAGE_SIZE = 20;



export default observer(class Plans extends Component {

    constructor(props){
        super(props);

        this.loadCategories();
        extendObservable(this, {
            filterCondition: [
                {
                    title: '类型',
                    key: 'category_id',
                    items: [{
                        name:'不限',
                        active: true
                    }]
                },
                {
                    title:'词量',
                    key: 'keyword_count',
                    items:[{
                        name:'不限',
                        active: true,
                    },{
                        name:'100词',
                        active: false,
                        value: 100
                    },
                        {
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
                }

            ],
            schemes: [],
            oldschemes: [],
            activePage: 1,
            totalPage: 0,


            sortKey: "keyword_count",
            sortOrder: {
                keyword_count: 0,
                scheme_turnover: 0,
                total_fee: 0,
                scheme_price: 0
            },
            activateSort: false,

            currentFilterParams: {},

            initLoading: true,

            sortedSchemes: computed(()=>{
                return _.sortBy(this.schemes, (val)=>{
                    return !val.purchased;
                });
                // if (!this.activateSort || this.sortOrder == 0) {
                //     return this.schemes.sort((val)=>{
                //         return val.purchased;
                //     });
                // }

                // return this.schemes.sort((val1, val2)=>{
                //     if (this.sortOrder == 1) {
                //         return val1[this.sortKey] - val2[this.sortKey];
                //     }
                //     else if (this.sortOrder == 2) {
                //         return val2[this.sortKey] - val1[this.sortKey];
                //     }
                // });
            }),
            baseModalShow: false,
            redirectUri: '',
            redirectId: 0
        });
        if (!this.getParam('categoryId')) {
            auth.checkStatus().then((isLogin)=>{
                this.loadScheme(objectAssign({
                    pageSize: PAGE_SIZE,
                    currentPage: this.activePage
                },this.currentFilterParams));
            });
        }
    }
    getParam(name) {
        var Locationurl;
        Locationurl = window.location.href;
        //url = decodeURIComponent(url);
        var r = new RegExp('(\\?|#|&)' + name + '=([^&#]*)(&|#|$)');
        var m = Locationurl.match(r);
        return m ? decodeURIComponent(m[2]) : null;
    }
    changeSortKey(key, order){
        this.sortOrder = {
            keyword_count: 0,
            scheme_turnover: 0,
            total_fee: 0,
            scheme_price: 0
        };
        this.sortKey = key;
        this.sortOrder[key] = order;
        this.activateSort = true;
        this.activePage = 1;
        this.loadScheme(objectAssign({
            pageSize: PAGE_SIZE,
            currentPage: this.activePage
        }, this.currentFilterParams));
    }

    render() {
        return (
            <div className="aso-plans">
                <div className="aso-container">
                    <FilterAccordion condition={this.filterCondition} onSelected={this.filterSelected.bind(this)} type="scheme"/>
                    <div className="aso-row aso-thead">
                        <div className="aso-thead-wrap">
                            <div className="text-left col-2">
                                <span className="text-center w70">选词方案</span>
                            </div>
                            <div className="text-center col-2">
                                {/* 词量 */}
                                <SortSpan reverse={this.sortOrder.keyword_count} onChange={(status)=>{this.changeSortKey("keyword_count", status)}} title="词量"/>            
                            </div>
                            <div className="text-center col-2">
                                <SortSpan reverse={this.sortOrder.scheme_turnover} onChange={(status)=>{this.changeSortKey("scheme_turnover", status)}} title="成交额"/>
                            </div>
                            <div className="text-center col-2">
                                {/* 执行价 */}
                                <SortSpan reverse={this.sortOrder.total_fee} onChange={(status)=>{this.changeSortKey("total_fee", status)}} title="执行价"/>
                            </div>
                            <div className="text-center col-2">
                                <SortSpan reverse={this.sortOrder.scheme_price} onChange={(status)=>{this.changeSortKey("scheme_price", status)}} title="方案价"/>
                            </div>
                            <div className="text-right col-2" style={{paddingRight:25}}>操作</div>
                        </div>
                    </div>
                    {this.sortedSchemes.map((val, index) => {
                        return (
                            <div className="common-item-wrapper" key={`key-${index}`}>
                                <div className="common-item plan-item aso-row">
                                    <div className="text-left col-2 plan-item__icon_tips">
                                        <img src={val.icon} width="70" height="70" className="plan-item__icon" alt=""/>
                                    </div>
                                    <div className="text-center col-2">
                                        <span>
                                            <b>{val.keyword_count}</b>词
                                        </span>
                                    </div>
                                    <div className="text-center col-2">
                                        <span><b>￥{(val.scheme_turnover / 10000).toFixed(1)}万</b></span>
                                    </div>
                                    <div className="text-center col-2">
                                        <span className="plan-item__price"><b>￥{ (val.total_fee / 10000).toFixed(1) }</b>万</span>
                                    </div>
                                    <div className="text-center col-2">
                                        <span className="plan-item__price"><b>￥{val.scheme_price}</b></span>
                                    </div>
                                    <div className="text-right col-2">
                                        {
                                            val.purchased ? <Button onClick={this.enterSchemeDetail.bind(this,val.id)} className="aso-style fixed-width-btn aso-style--yellow" bsStyle="primary">执行方案</Button> : (<Button className="aso-style fixed-width-btn" onClick={this.purchaseScheme.bind(this,val)} bsStyle="primary">购买方案</Button>)
                                        }
                                    </div>
                                    {val.purchased && (<span onClick={this.openSchemeDetail.bind(this, val)} className="plan-item__dropdown">详情</span>)}
                                </div>
                                <Panel collapsible expanded={val.expand} className="aso-detail-panel">
                                    <KeywordList max={20} data={val.keywordslist}/>
                                    {val.keywordslist.length > 2 && (
                                        <div className="keyword-list__showall">
                                            <div className="HideBtn" onClick={this.openSchemeDetail.bind(this, val)}>收起</div>
                                        </div>)
                                    }
                                </Panel>
                            </div>
                        )
                    })}

                    <Loading show={this.initLoading}/>
                    <NoData show={!this.initLoading && !this.sortedSchemes.length}/>
                    {this.totalPage > 1 && (
                        <div className="aso-plans__pagination">
                            <MyPagination  
                                activePage={this.activePage}
                                items={this.totalPage}
                                onSelect={this.handleSelect.bind(this)}
                                prev={()=>{ this.handleSelect.bind(this, this.activePage - 1)() }}
                                next={()=>{ this.handleSelect.bind(this, this.activePage + 1)() }}
                            />
                        </div>
                    )}
                </div>
                <UserBase redirectUri = {this.redirectUri} hide={()=>{ this.baseModalShow = false; }} showType = "login" showModal = {this.baseModalShow} onChange={(data)=>{
                    // 判断这个id是否购买 15210098243 or sdaujsjzcc@163.com 123456
                    Service.isBuyCase({
                        schemeId: this.redirectId
                    }).then((res)=>{
                        // 未购买
                        if (res.data.status == 200 && !res.data.data) {
                            // 跳转到购买页
                            window.location.href = `${window.location.origin}/schemepay/${this.redirectId}/0`;
                        }
                        else {
                            if (this.redirectUri && this.redirectUri !== '') {
                                window.location.href =  this.redirectUri;
                            }
                            else {
                                window.location.reload();
                            }
                        }
                    }).catch(()=>{
                        if (this.redirectUri && this.redirectUri !== '') {
                            window.location.href =  this.redirectUri;
                        }
                        else {
                            window.location.reload();
                        }
                    });
                }}/>
            </div>
        );
    }

    enterSchemeDetail(id){
        // 进入方案详情页 不携带应用信息
        this.props.history.push({
            pathname: '/schemedetail/' + id
        });

    }

    handleSelect(page){
        this.loadScheme(objectAssign({
            pageSize: PAGE_SIZE,
            currentPage: page,
        }, this.currentFilterParams));
    }

    loadScheme(params){
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

        Service.listScheme(params).then((response)=>{
            if (response.data.status === 200 && response.data.data) {
                let entity = response.data.data;
                this.totalPage = entity.totalPage;
                this.activePage = entity.pageNo;
                this.schemes = entity.result.map((val)=>{
                    val.expand = false;
                    val.keywordslist = [];
                    val.loadKeywords = false;
                    return val;
                });
                // 存储到cookie当中
                Common.setCookie('categoryId', params.category_id || 0, 1);
                window.scrollTo(0, 0);
                setTimeout(() => {
                    for(var i = 0; i < lis.length ; i++){
                        lis[i].removeAttribute('disabled');
                    }
                }, 10);
            }

            this.initLoading = false;

        }).catch(()=>{

            this.initLoading = false;
            for(var i = 0; i < lis.length ; i++){
                lis[i].removeAttribute('disabled');
            }
        })
    }

    openSchemeDetail(data){
        data.expand = !data.expand;
        if (data.expand && !data.loadKeywords) {
            Service.getSchemeKeywords(data.id).then((res)=>{
                if (res.data.status === 200 && res.data.data) {
                    data.keywordslist = res.data.data;
                    data.loadKeywords = true;
                }
            });
        }
    }

    purchaseScheme(data){
        auth.checkStatus().then((isLogin)=>{
            if (isLogin) {
               window.location.href = `${window.location.origin}/schemepay/${data.id}/0`;
            }
            else {
                if (this.currentFilterParams.category_id && this.currentFilterParams.category_id > 0) {       
                    this.redirectUri = `${window.location.origin}/schemes?categoryId=${this.currentFilterParams.category_id}`;
                }
                else {
                    this.redirectUri = '';
                }
                this.redirectId = data.id;
                this.baseModalShow = true;
            }
        });
    }

    loadCategories(){
        Service.getSchemeCategory().then((res)=>{
            if (res.data.status === 200 && res.data.data) {
                this.filterCondition = [
                    {
                        title: '类型',
                        key: 'category_id',
                        items: [{
                            name:'不限',
                            active: true
                        }].concat(res.data.data.map((val)=>{
                            val.name = val.category_name;
                            val.active = false;
                            val.value = val.category_id;
                            return val;
                        }))
                    },
                    {
                        title:'词量',
                        key: 'keyword_count',
                        items:[{
                            name:'不限',
                            active: true
                        },
                        {
                            name:'100词',
                            active: false,
                            value: 100
                        },
                        {
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
                    }
                ];
            }
        });
    }

    filterSelected(value){
        let params = {};
        value.forEach((val, index)=>{
            if (val.name !== '不限') {
                let key = this.filterCondition[index].key;
                params[key] = val.value;
            }
        });
        this.currentFilterParams = params;
        this.loadScheme(objectAssign({
                pageSize: PAGE_SIZE,
                currentPage: 1
        },this.currentFilterParams));


    }
});

