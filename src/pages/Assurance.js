import React, { Component } from 'react';
import {observer} from "mobx-react";
import {extendObservable,computed,autorun} from "mobx";
import { Accordion, Panel, Button } from 'react-bootstrap';
import objectAssign from 'object-assign';
import _ from 'underscore';
import auth from '../auth';
import Service from '../service';
const queryString = require('query-string');
var ReactToastr = require("react-toastr");
var {ToastContainer} = ReactToastr;
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

export default observer(class Assurance extends Component {

    constructor(props){
        super(props);
        auth.checkStatus().then((isLogin)=>{
        });
    }

    render() {
        return (
            <div className="aso-chart">
				<div className="aso-chart-main">
                    <h2 className="aso-chart-title">担保应用查询</h2>
                    <form className="aso-chart__search"  onSubmit={this.enterSearch.bind(this)}>
                        <input ref="keyword" placeholder="搜索应用名称或APPID"/>
                        <span onClick={this.enterSearch.bind(this)}>
                            <i className="aso-icon-search"></i>
                            查询
                        </span>
                    </form>
				</div>
                <div className="aso-assurance-progress"></div>
                {/* <div className="aso-assurance-bg"></div> */}
                <ToastContainer ref="container"
	                        toastMessageFactory={ToastMessageFactory}
	                        className="toast-top-right" />
            </div>
        );
    }
    enterSearch(evt){
        evt.preventDefault();
        let kw = this.refs.keyword.value.trim();
        if (kw.length) {
            if ((/^[0-9]+$/).test(kw)) {
                Service.checkAppId(kw).then((res) => {
                    if (res.data.status === 200 && res.data.isAppId) {      
                        window.location.href = `${window.location.origin}/assurance/detail/${kw}`;
                    }
                    else {
                        this.goSearchPage(kw); 
                    }
                });
            }
            else {
                this.goSearchPage(kw);
            }
        }
        else {
            this.refs.container.warning(
                "",
                "关键词不能为空", 
                {
                    timeOut: 2000,
                    extendedTimeOut: 0,
                    showAnimation: 'animated fadeInDown',
                    hideAnimation: 'animated fadeOutUp',
                }
            );      
        }
    }
    goSearchPage(kw) {
        this.props.history.push(`/assurance/search/${kw}?openfrom=4`);
    }
});

