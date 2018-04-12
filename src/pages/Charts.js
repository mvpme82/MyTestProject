import React, { Component } from 'react';
import {observer} from "mobx-react";
import {extendObservable,computed,autorun} from "mobx";
import { Accordion, Panel, Button } from 'react-bootstrap';
import objectAssign from 'object-assign';
import _ from 'underscore';
import auth from '../auth';

var ReactToastr = require("react-toastr");
var {ToastContainer} = ReactToastr;
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

export default observer(class Charts extends Component {

    constructor(props){
        super(props);
        auth.checkStatus().then((isLogin)=>{
        });
    }

    render() {
        return (
            <div className="aso-chart">
				<div className="aso-chart-main">
                    <h2 className="aso-chart-title">竞争指数查询</h2>
                    <form className="aso-chart__search"  onSubmit={this.enterSearch.bind(this)}>
                        <input ref="keyword" placeholder="输入关键词，多个关键词用逗号隔开"/>
                        <span onClick={this.enterSearch.bind(this)}>
                            <i className="aso-icon-search"></i>
                            查询
                        </span>
                    </form>
				</div>
                <div className="aso-chart-bg"></div>
                <ToastContainer ref="container"
	                        toastMessageFactory={ToastMessageFactory}
	                        className="toast-top-right" />
            </div>
        );
    }
    enterSearch(evt){
        evt.preventDefault();
        let kw = this.refs.keyword.value;
        if (kw) {
            this.props.history.push(`/charts/result#${kw}`);
        }
        else {
            this.refs.container.error(
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
});

