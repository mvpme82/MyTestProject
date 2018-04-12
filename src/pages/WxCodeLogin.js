import React, { Component } from 'react';
import FilterAccordion from '../components/FilterAccordion';
import {observer} from "mobx-react";
import {extendObservable,computed,autorun} from "mobx";
import { Accordion, Panel, Button } from 'react-bootstrap';
import Service from '../service';
import objectAssign from 'object-assign';
import _ from 'underscore';
import auth from '../auth';
import config from '../config';
// 公共方法
import common from '../common';

var imgCodeUrl = config.HOST_LOGIN + '/api/getAuthImage?rnd=';
var redirectUri = '';

const phoneValidate = /^1[3|4|5|7|8]\d{9}$/; //手机号正则
const emailValidate =  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; //邮箱正则
const isChinese = /[\u4e00-\u9fa5]/;//是否包含中文

export default observer(class Login extends Component {

    constructor(props){
        super(props);
        this.state = {
            marginTopStyle: 60,
            errMsg: ''
        }
        this.loadCode();
    }
    loadCode() {
        redirectUri = common.getUrlParams().redirect_uri;
        Service.loginWithWeixin().then(res => {
            if (res.data.status == 200) {
                let wx = res.data.data;
                let config = {
                    id: "login_container", 
                    appid: wx.appid, 
                    scope: "snsapi_login", 
                    redirect_uri: wx.redirect_uri,
                    state: redirectUri
                };
                var obj = new window.WxLogin(config);
            }
        });
    }
    render() {
        return (
            <div className="aso-base-info aso-login">
                <div className="aso-container">
                    <div className="wx_login" style={{marginTop: this.state.marginTopStyle + 'px'}}>
                        <div className="login-tab login-tab-center">
                            <h2 className="login-title active">二维码登录</h2>
                        </div>
                        <div className="wx-login">
                            <div className="img" id="login_container">
                            </div>
                            {/* <span className="img-span">打开微信扫一扫</span>
                            <a className="message-login" href={`/login?redirect_uri=${redirectUri}`}>短信快捷登录</a> */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

