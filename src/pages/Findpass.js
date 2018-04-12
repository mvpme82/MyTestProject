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
import Carousel from '../components/form-component/carousel';

var imgCodeUrl = config.HOST_LOGIN + '/api/getAuthImage?rnd=';
var redirectUri = '';

const phoneValidate = /^1[3|4|5|7|8]\d{9}$/; //手机号正则
const emailValidate =  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; //邮箱正则
const isChinese = /[\u4e00-\u9fa5]/;//是否包含中文

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

            // 图形验证码是否验证成功
            sendQR: false,
            //是否发送验证码，
            ifSendQrcode: false,
            //记录获取验证码请求状态，防止多次发送请求
            codeFlag: true,
            //记录注册请求状态，防止多次发送请求
            nextFlag: true,
            //记录请求设置新密码 请求状态，防止多次发送请求***先为true方便测试，加上请求后要改为false
            updateFlag: true,

            //记录请求设置新密码 请求状态，防止多次发送请求***先为true方便测试，加上请求后要改为false
            newPwdOk: true,

            isLoginLoad: false,

            cookieShow: false,
            hasCookie: window.navigator.cookieEnabled,
            carouselIndex: 0

        }
    }

    render() {
        return (
            <div className="aso-base-info aso-login">
                <div className="aso-container">
                    <div className="container_login" style={{marginTop: this.state.marginTopStyle + 'px'}}>
                        <div className="login-tab login-tab-center">
                            <h2 className="login-title active">{this.state.nextFlag ? "找回密码" : "设置新密码"}</h2>
                        </div>
                        {this.state.nextFlag && this.renderFirst()}
                        {!this.state.nextFlag && this.renderSecond()}
                        <p className="errorMsg_login">
                            {this.state.errMsg}
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    // 第一步
    renderFirst() {
        return (
            <div>
                <div className="aso-formgroup aso-formgroup-login">
                    <input type="text" placeholder="手机号/邮箱" className="form-control mb15" defaultValue={this.state.userName} onChange={this.inputFormName.bind(this, 'name')}/>
                    <div className="form-login-group mb15 clearfix">
                        <input type="text" placeholder="验证码" className="form-control vertify fl" value={this.state.imgCode} onChange={this.inputFormName.bind(this, 'imgcode')}/>
                        <img className="btn_vertify fr" onClick={this.changeImg.bind(this)} title="看不清楚？换一张" src={this.state.imgUrl}/>
                    </div>
                    <div className="form-login-group mb15 clearfix">
                        <input type="text" placeholder="验证码" className="form-control vertify fl" defaultValue={this.state.telCode} onChange={this.inputFormName.bind(this, 'telcode')}/>
                        <div className="btn_vertify fr">
                            <a className={this.state.telClass}  onClick={this.getQrocde.bind(this)}>{this.state.telBtnLabel}</a>
                        </div>
                    </div>
                </div>
                <div className="btnContainer">
                    <span className="login_btn" disabled={!this.state.nextFlag} onClick={this.nextFind.bind(this)}>下一步</span>
                </div>
                {!this.state.hasCookie && (
                    <span className="cookie">
                        开启Cookie之后才能登录，
                        <a className="link-left" onClick={() => {
                            this.setState({
                                cookieShow: true
                            })
                        }}>如何开启？</a>
                    </span>
                )}
                <Carousel index={this.state.carouselIndex} show={this.state.cookieShow} hide={(index)=>{
                    this.setState({
                        cookieShow: false,
                        carouselIndex: index
                    })
                }}></Carousel>
            </div>
        )
    }
    // 第二步
    renderSecond() {
        return (
            <div>
                <div className="aso-formgroup aso-formgroup-login">
                    <input type="password" placeholder="新密码" className="form-control mb15" defaultValue={this.state.passWord} onChange={this.inputFormName.bind(this, 'pass')}/>
                </div>
                <div className="btnContainer">
                    <span className="login_btn" disabled={this.state.isLoginLoad} onClick={this.nextSecond.bind(this)}>{this.state.isLoginLoad ? '更 新 中...' : '确 定'}</span>
                </div>
            </div>
        )
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
                    errMsg: '验证码错误',
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
        if (this.state.telLoad) {
            return;
        }
        var self = this;
        var name = this.state.userName;
        var tcode = this.state.telCode;
        var icode = this.state.imgCode;
        if (name === '') {
            this.setState({
                errMsg: '账号不能为空'
            });
        }
        else if (!phoneValidate.test(name) && !emailValidate.test(name)) {
            this.setState({
                errMsg: '账号格式不正确'
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
                    else {
                        this.countTimer();
                    }
                });
            }
        }
    }

    /**
     * 修改名称和密码
     * @param  {string} type [策略详情，name or id]
     * @param  {Object} e    [当前数据对象]
     */
    inputFormName(type, e) {
        var self = this;
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
                if (value.length > 5) {
                    this.checkOld(value, (res) => {
                        if (res.status == '200' && res.result) {
                            // 不能与旧密码相同"
                            self.setState({
                                errMsg: '不能与旧密码相同',
                                newPwdOk: false
                            });
                        }
                        else {
                            self.setState({
                                errMsg: '',
                                newPwdOk: true
                            });
                        }
                    });
                }
            break;
            case 'passsure':    
                this.setState({
                    surePassWord: value
                });
            break;
            case 'imgcode':
                if (value.length >= 4) {
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
     *  下一步
     * 
     */
    nextFind() {
        if (!this.state.nextFlag) {
            return;
        }
        var name = this.state.userName;
        var icode = this.state.imgCode;
        var tcode = this.state.telCode;

        if (name == '') {
            this.setState({
                errMsg: '账号不能为空'
            });
        }
        else if (!phoneValidate.test(name) && !emailValidate.test(name)) {
            this.setState({
                errMsg: '账号格式不正确'
            });
        }
        else if (icode.length == 0) {//验证码
            this.setState({
                errMsg: '图片验证码不能为空'
            });
        }
        else if (!this.state.sendQR) {
            this.setState({
                errMsg: '图片验证码错误'
            });
        }
        else if (tcode.length == 0) {
            this.setState({
                errMsg: phoneValidate.test(name) ? '短信验证码不能为空' : '邮箱验证码不能为空'
            });
        }
        else if(!this.state.ifSendQrcode){
            this.setState({
                errMsg:  phoneValidate.test(name) ? '短信验证码错误或已失效' : '邮箱验证码错误或已失效'
            });
        }
        else {
            this.setState({
                errMsg: ''
            });   
            if (this.state.nextFlag) {
                redirectUri = redirectUri ? redirectUri : 'http://www.kuchuan.com/';
                Service.nextStepBase({
                    account: name,
                    vCode: tcode,
                    i: true
                }).then((res)=>{
                    if (res.data.result) {
                        this.setState({
                            errMsg: '',
                            registerFlag: true,
                            nextFlag: false
                        });
                    }
                    else {
                        this.setState({
                            errMsg: res.data.msg,
                            registerFlag: true,
                            nextFlag: true
                        });
                    }
                }).catch(()=>{
                    this.setState({
                        errMsg: '网络连接错误，请重试',
                        registerFlag: true,
                        nextFlag: true
                    });
                });
            } 
        }
    }

    nextSecond() {
        var self=this;
        var name = this.state.userName;
        var pass = this.state.passWord;
        if (this.state.nextFlag || this.state.isLoginLoad) {
            return;
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
        else {
            this.setState({
                errMsg: '',
                isLoginLoad: true
            });

            this.checkOld(pass, (res) => {
                if (res.status == '200' && res.result) {
                    // 不能与旧密码相同"
                    this.setState({
                        errMsg: '不能与旧密码相同"',
                        newPwdOk: false,
                        isLoginLoad: false
                    });
                }
                else {
                    if (this.state.updateFlag) {
                        this.setState({
                            updateFlag: false,
                            newPwdOk: true
                        });
                        Service.setNewPwd({
                            account: this.state.userName,
                            pswd: pass,
                            vCode: this.state.telCode
                        }).then((res)=>{
                            if (!res.data.result) {
                                // 不能与旧密码相同"
                                this.setState({
                                    errMsg: res.data.msg
                                });
                            }
                            else {
                                window.location.href = redirectUri;
                            }
                            this.setState({
                                isLoginLoad: false
                            })
                        }).catch(()=>{
                            this.setState({
                                errMsg: '网络连接错误，请重试',
                                isLoginLoad: false
                            });
                        });
                    }
                }
            })
        }
    }


    checkOld(pass, cb) {
        Service.checkOldPwd({
            account: this.state.userName,
            password: pass
        }).then((res)=>{
            cb && cb(res.data)
        }).catch(()=>{
            this.setState({
                errMsg: '网络连接错误，请重试'
            });
        });
    }
    loginAnimate() {
        var windowHeight = document.documentElement.clientHeight;
        var contentHeight = windowHeight - 124;
        var marginTopStyle  = (contentHeight - 255) / 2.5;
        this.setState({
            marginTopStyle: marginTopStyle
        });
    }
    componentDidMount() {
        redirectUri = common.getUrlParams().redirect_uri;
        this.loginAnimate();

        // 监听按键
        document.addEventListener('keyup',(e) => {
            if (e.keyCode == 13) {
                if (this.state.nextFlag) {
                    this.nextFind();
                }
                else {
                    this.nextSecond();
                }
            }
        });
    }
});

