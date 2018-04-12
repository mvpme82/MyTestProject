import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import {extendObservable, computed, autorun} from "mobx";
import {headerDelegate} from '../components/Header';
import Service from '../service';
import {observer} from "mobx-react";
import auth from '../auth';
import Common from '../common';

// 引入登录弹框功能
import UserBase from '../components/UserBase';
export default observer(class Home extends Component {
    constructor(){
        super();
        
        auth.checkStatus().then((isLogin)=>{});
        this.loadRecommendSchemes();
        
        this.state = {
            schemes: []
        };
        extendObservable(this, {
            baseModalShow: false,
            redirectUri: '',
            redirectId: 0
        });

        var source = Service.getParam('source');
        if (source) {
            Common.setCookie('kuchuanSource', source);
        }
        else {
            Common.delCookie('kuchuanSource');
        }
        this.selectKey = 1;
    }
    render() {
        return (
            <div className="aso-home" ref="asohome">
                <div className="aso-banner">
                    <div className="aso-container">
                        <div className="aso-banner-text">
                            6&nbsp;6&nbsp;a&nbsp;s&nbsp;o&nbsp;，排&nbsp;&nbsp;名&nbsp;&nbsp;优&nbsp;&nbsp;化&nbsp;&nbsp;6&nbsp;&nbsp;6&nbsp;&nbsp;6&nbsp;&nbsp;!
                        </div>
                        {!headerDelegate.activeHeader && (
                            <div className="aso-banner__tabs">
                                <Tabs defaultActiveKey={this.selectKey} onSelect={(key)=>{ this.selectKey = key; }} id="aso-banner__tabs">
                                    <Tab eventKey={0} title="ASO方案"></Tab>
                                    <Tab eventKey={1} title="自助下单"></Tab>
                                    <Tab eventKey={2} title="自助监控"></Tab>
                                </Tabs>
                                <form onSubmit={this.enterSearch.bind(this)} className="aso-banner__search">
                                    <input ref="keyword" placeholder="搜索应用名称或APPID"/>
                                    <span onClick={this.enterSearch.bind(this)}>
                                        <i className="aso-icon-search"></i>
                                        <span>搜APP</span>
                                    </span>
                                </form>
                            </div>
                        )}
                        <div className="aso-banner-slogans">
                            <div className="aso-banner-slogan">
                                <img className="d" src={require('../images/1-1.png')} style={{}} />
                                <img className="f" src={require('../images/1-2.png')} style={{}} />
                            </div>
                            <div className="aso-banner-slogan">
                                <img className="d" src={require('../images/2-1.png')} style={{}} />
                                <img className="f" src={require('../images/2-2.png')} style={{}} />
                            </div>
                            <div className="aso-banner-slogan">
                                <img className="d" src={require('../images/3-1.png')} style={{}} />
                                <img className="f" src={require('../images/3-2.png')} style={{}} />
                            </div>
                            <div className="aso-banner-slogan">
                                <img className="d" src={require('../images/4-1.png')} style={{}} />
                                <img className="f" src={require('../images/4-2.png')} style={{}} />
                            </div>
                            <div className="aso-banner-slogan">
                                <img className="d" src={require('../images/5-1.png')} style={{}} />
                                <img className="f" src={require('../images/5-2.png')} style={{}} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="aso-plan aso-container">
                    <div className=""></div>
                    {this.renderPlans()}
                </div>
                
                <UserBase redirectUri = {this.redirectUri} hide={()=>{ this.baseModalShow = false; }} showType = "login" showModal = {this.baseModalShow} onChange={(data)=>{
                    // 判断这个id是否购买 15210098243  123456
                    this.toPurchaseSchemeDetail(this.redirectId);
                }}/>
            </div>
        );
    }
    renderPlans(){
        var that = this;
        return (
            <div className="aso-plan__list clearfix">
            {this.state.schemes.map(function (total, index) {
                return (
                    <div className="kindTotal" key={"key-" + index}>
                        <div className="categoryZone">
                            <i className="aso-icon-juxing" />
                            <span className="category">{total.category}类</span>
                            <a href={`/schemes?categoryId=${total.categoryData[0].categoryId}`} className="more">
                                更多
                                <i className="f-icon f-icon-more"></i>
                            </a>
                        </div>
                        {total.categoryData.map(function (val,index) {
                            return (
                                <div onClick={that.toPurchaseScheme.bind(that, val)} className="plan-card pull-left" key={"key-" + index}>
                                    <span className="price-badge">¥{val.schemePrice}</span>
                                    <div className="plan-card__body">
                                        {/* <div className="plan-card__mask" style={{'backgroundImage':'url("'+ val.icon +'")'}}></div> */}
                                        <dl className="plan-card__detail">
                                            <dt><b></b></dt>
                                            <dd><img alt="" width="77" height="77" src={val.icon}/></dd>
                                        </dl>
                                    </div>
                                    <div className="plan-card__footer">
                                        <div><span>执行价</span> { (val.totalFee / 10000).toFixed(1) }万</div>
                                        <div>{val.keywordCount}词</div>
                                    </div>
                                </div>);
                            }
                        )}
                    </div>);
                })}
            </div>
        );
    }


    loadRecommendSchemes(){
        Service.getRecommendSchemes().then((res)=>{
            if (res.data.status === 200) {
                this.setState({
                  schemes: res.data.data
                })
            }
        });
    }

    /**
     * 跳转到详情页
     * 
     * @param {Object} val 数据原形对象 
     */
    toPurchaseScheme(val){
        auth.checkStatus().then((isLogin)=>{
            if (isLogin) {
                this.toPurchaseSchemeDetail(val.schemeId);
            }
            else {
                this.baseModalShow = true;
                this.redirectId = val.schemeId;
                this.redirectUri = '';
            }
        });  
    }
    toPurchaseSchemeDetail(id) {
        Service.isBuyCase({
            schemeId: id
        }).then((res)=>{
            // 未购买
            if (res.data.status == 200 && !res.data.data) {
                // 跳转到购买页
                window.location.href = `${window.location.origin}/schemepay/${id}/0`;
            }
            else {
                window.location.href = `${window.location.origin}/schemedetail/${id}/0`;
            }
        }).catch(()=>{
            window.location.reload();
        });
    }

    enterSearch(evt){
        evt.preventDefault();
        let kw = this.refs.keyword.value.trim();
        if (kw.length) {
            if ((/^[0-9]+$/).test(kw)) {
                Service.checkAppId(kw).then((res)=>{
                    if (res.data.status === 200 && res.data.isAppId) {
                        var path = `/appdetail/${kw}`;       
                        switch(+this.selectKey) {
                            case 1:
                                path = path + '/open/order'
                            break;
                            case 2:
                                path = path + '/open/monitor'
                            break;
                        }

                        this.props.history.push({
                            pathname: path,
                            openfrom: this.selectKey
                        });
                    }
                    else {
                        this.props.history.push({
                            pathname:`/search/${kw}`,
                            openfrom: this.selectKey
                        });      
                    }
                })
            }
            else {
                this.props.history.push({
                    pathname:`/search/${kw}`,
                    openfrom: this.selectKey
                });
            }
        }
    }

    componentDidMount() {
        this._handleScroll();
        window.addEventListener('scroll', this._handleScroll);
    }
    componentWillUnmount() {
        window.removeEventListener('scroll', this._handleScroll);
    }
    _handleScroll() {
        let offsetTop = document.documentElement.scrollTop || document.body.scrollTop;
        if (offsetTop >= 120) {
            headerDelegate.activeHeader = true;
        } else {
            headerDelegate.activeHeader = false;
        }
    }
});

