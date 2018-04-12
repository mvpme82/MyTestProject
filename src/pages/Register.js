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
var phoneValidate = /^1[3|4|5|7|8]\d{9}$/; //手机号正则
var isChinese = /[\u4e00-\u9fa5]/; //验证中文
export default observer(class Login extends Component {

    constructor(props){
        super(props);
        this.state = {
            marginTopStyle: 100,
            errMsg: '',
            userName: '',
            passWord: '',
            surePassWord: '',
            imgCode: '',
            imgCodeResult: false,
            imgUrl:  imgCodeUrl + Math.random(),
            telCode: '',
            telCodeResult: false,
            telLoad: false,
            telBtnLabel: '获取验证码',
            telClass: 'btn',
            check: true,

            // 图形验证码是否验证成功
            sendQR: false,
            //是否发送验证码，
            ifSendQrcode: false,
            //记录获取验证码请求状态，防止多次发送请求
            codeFlag: true,
            //记录注册请求状态，防止多次发送请求
            registerFlag: true,
            registerLabel: '注册',
            source: '',
            redirectUri: ''
        }
    }

    render() {
        return (
            <div className="aso-base-info aso-login">
                <div className="aso-container">
                    <div className="container_login" style={{marginTop: this.state.marginTopStyle + 'px'}}>
                        <h2 className="login-title">注册</h2>
                        <div className="aso-formgroup aso-formgroup-login">
                            <input type="text" placeholder="手机号" className="form-control mb15" defaultValue={this.state.userName} onChange={this.inputFormName.bind(this, 'name')}/>
                            <input type="password" placeholder="密码" className="form-control mb15" defaultValue={this.state.passWord} onChange={this.inputFormName.bind(this, 'pass')}/>
                            <input type="password" placeholder="确认密码" className="form-control mb15" defaultValue={this.state.surePassWord} onChange={this.inputFormName.bind(this, 'passsure')}/>

                            <div className="form-login-group mb15 clearfix">
                                <input type="text" placeholder="验证码" className="form-control vertify fl" value={this.state.imgCode} onChange={this.inputFormName.bind(this, 'imgcode')}/>
                                <img className="btn_vertify fr" onClick={this.changeImg.bind(this)} title="看不清楚？换一张" src={this.state.imgUrl}/>
                            </div>
                            <div className="form-login-group mb15 clearfix">
                                <input type="text" placeholder="短信验证码" className="form-control vertify fl" defaultValue={this.state.telCode} onChange={this.inputFormName.bind(this, 'telcode')}/>
                                <div className="btn_vertify fr">
                                    <a className={this.state.telClass}  onClick={this.getQrocde.bind(this)}>{this.state.telBtnLabel}</a>
                                </div>
                            </div>
                        </div>
                        <div className="agreement">
                            <div className="remember fl" onClick={this.changeCheck.bind(this)}>
                                <input type="checkbox" className="fl" checked={this.state.check} readOnly/>
                                <span className="agreementLink fl">
                                    同意网站的
                                    <a className="link-left" href="/agreement" target="_blank">《使用协议》</a>
                                </span>
                            </div>
                        </div>
                        <div className="btnContainer">
                            {this.state.check && (
                                <span className="login_btn" disabled={!this.state.registerFlag} onClick={this.checkRegister.bind(this)}>{this.state.registerLabel}</span>
                            )}
                            {!this.state.check && (
                                <span className="login_btn login_btn_disabled">注 册</span>
                            )}
                            <p className="loginLink loginLink-pa">
                                已有账号，<a className="link" href={`/login?redirect_uri=${this.state.redirectUri}`}>立即登录</a>
                            </p>
                        </div>
                        <p className="errorMsg_login">
                            {this.state.errMsg}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    changeImg() {
        var imgUrl = imgCodeUrl + Math.random();
        this.setState({
            imgUrl: imgUrl,
            imgCode: ''
        })
    }
    checkImgCode(val) {
        Service.imgCode(val.toUpperCase()).then((res)=>{
            if (res.data.result) {
                this.setState({
                    errMsg: '',
                    sendQR: true
                });
            }
            else{
                this.setState({
                    errMsg: '图片验证码错误',
                    sendQR: false
                });
            }
        });
    }

    /**
     * 获取验证码
     * 
     */
    getQrocde() {//获取验证码
        var self = this;
        var name = this.state.userName;
        var tcode = this.state.telCode;
        var icode = this.state.imgCode;
        if (name === '') {
            this.setState({
                errMsg: '手机号不能为空'
            });
        }
        else if (!phoneValidate.test(name)) {
            this.setState({
                errMsg: '手机号格式不正确'
            });
        }
        else if (icode === '') {
            this.setState({
                errMsg: '图片验证码不能为空'
            });
        }
        else if (!this.state.sendQR) {
            this.setState({
                errMsg: '图片验证码错误'
            });
        }
        else {
            this.setState({
                errMsg: ''
            });
            Service.telCode({
                account: name
            }).then((res)=>{
                if (res.data.result) {
                    // 手机号被注册过了
                    this.setState({
                        errMsg: '此账号已被注册'
                    });
                    return;
                }
                this.countTimer();
                if (this.state.codeFlag) {
                    this.setState({
                        codeFlag: false
                    });
                    Service.sendTelCode({
                        account: name,
                        imageVcode: icode
                    }).then((res)=>{
                        this.setState({
                            ifSendQrcode: true,
                            codeFlag: true
                        });
                        if(res.data.status !== 200){
                            this.setState({
                                errMsg: res.data.msg
                            });
                        }
                    });
                }
            });
        }
    }

    /**
     * 修改名称和密码
     * @param  {string} type [策略详情，name or id]
     * @param  {Object} e    [当前数据对象]
     */
    inputFormName(type, e) {
        var value = e.target.value;
        switch (type) {
            case 'name':
                this.setState({
                    userName: value
                });
            break;
            case 'pass':
                this.setState({
                    passWord: value
                });
            break;
            case 'passsure':
                this.setState({
                    surePassWord: value
                });
            break;
            case 'imgcode':
                if (value.length == 4) {
                    this.checkImgCode(value);
                }
                this.setState({
                    imgCode: value
                });
            break;
            case 'telcode':
                this.setState({
                    telCode: value
                });
            break;
        }
    }

    /**
     * 切换选项
    */
    changeCheck() {
        var check = this.state.check;
        this.setState({
            check: !check
        });
    }
    /*
    * @ purpose:验证码60s倒计时重新发送
    * @ createTime：2016-8-10 12:21
    * @ author：王翠翠
    * */
    countTimer() {
        //60秒倒计时函数
        var self = this;
        var time = 60;
        if (this.state.telLoad) {
            return;
        }
        this.setState({
            telBtnLabel: time + ' s',
            telLoad: true,
            telClass: 'btn btn_disabled'
        });

        /*获取验证码代码待写*/
        var interval= window.setInterval(() => {
            time--;
            this.setState({
                telBtnLabel: time + ' s'
            });
            if(time < 0){
                window.clearInterval(interval)
                this.setState({
                    telBtnLabel: '重新发送',
                    telLoad: false,
                    telClass: 'btn'
                });
            }
        },1000)
    }
    /**
     *  注册
     * 
     */
    checkRegister() {
        
        var name = this.state.userName;
        var pass = this.state.passWord;
        var surepass = this.state.surePassWord;
        var icode = this.state.imgCode;
        var tcode = this.state.telCode;
        if (!this.state.registerFlag) {
            return;
        }
        else if (name == '') {
            this.setState({
                errMsg: '账号不能为空'
            });
        }
        else if (!phoneValidate.test(name)) {
            this.setState({
                errMsg: '账号格式不正确'
            });
        }
        else if (icode.length==0) {//验证码
            this.setState({
                errMsg: '图片验证码不能为空'
            });
        }
        else if (!this.state.sendQR) {
            this.setState({
                errMsg: '图片验证码错误'
            });
        }
        else if (tcode.length==0) {
            //验证码
            this.setState({
                errMsg: '短信验证码不能为空'
            });
        }
        else if(!this.state.ifSendQrcode){
            this.setState({
                errMsg: '短信验证码错误或已失效'
            });
        }
        else if (pass == '') {
            this.setState({
                errMsg: '密码不能为空'
            });
        }
        else if (pass.length < 6 || pass.length > 24) {
            this.setState({
                errMsg: '密码在6~24位之间'
            });
        }
        else if (isChinese.test(pass)) {
            this.setState({
                errMsg: '密码不能包含中文'
            });
        }
        else if (surepass == '') {
            this.setState({
                errMsg: '确认密码不能为空'
            });
        }
        else if (surepass.length < 6) {
            this.setState({
                errMsg: '确认密码不能少于6位'
            });
        }
        else if (isChinese.test(surepass)) {
            this.setState({
                errMsg: '确认密码不能包含中文'
            });
        }
        else if (surepass !== pass) {
            this.setState({
                errMsg: '密码和确认密码不相等'
            });
        }
        else {
            this.setState({
                errMsg: ''
            });   
            if (this.state.registerFlag) {
                this.setState({
                    registerFlag: false,
                    registerLabel: '注册中...',
                }); 
                if (this.state.redirectUri == '') {
                    this.setState({
                        redirectUri: 'http://www.kuchuan.com/'
                    }); 
                }
                Service.telCode({
                    account: name
                }).then((res)=>{
                    if (res.data.result) {
                        // 手机号被注册过了
                        this.setState({
                            errMsg: '此账号已被注册',
                            registerFlag: true,
                            registerLabel: '注册'
                        });
                    }
                    else {
                        Service.registBase({
                            vCode: tcode,
                            source: this.state.source,
                            phone: name,
                            password: pass
                        }).then((res)=>{
                            this.setState({
                                errMsg: '',
                                registerFlag: true,
                                registerLabel: '注册'
                            });

                            if(res.data.result){//注册成功
                                common.setCookie('account', name, 1); 
                                window.location.href = this.state.redirectUri;
                            }else{
                                this.setState({
                                    errMsg: res.data.msg,
                                    registerLabel: '注册'
                                });
                            }
                        });
                    }
                }).catch(()=>{
                    this.setState({
                        errMsg: '网络连接错误，请重试'
                    });
                });
            }
        }
    }

    componentDidMount() {
        let redirectUri = common.getUrlParams().redirect_uri;
        this.setState({
            redirectUri: redirectUri
        })
        auth.checkStatus().then((isLogin)=>{
            if (isLogin) {
                window.location.href = decodeURIComponent(redirectUri);;
            }
        });
        // 监听按键
        document.addEventListener('keyup',(e) => {
            if (e.keyCode == 13) {
                this.checkRegister();
            }
        });
    }
});

