import React, { Component } from 'react';
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
let redirectUri = '';
const cookieKey = '68f04b2cb36d263908f74c889f6189aa';
const phoneValidate = /^1[3|4|5|7|8]\d{9}$/; //手机号正则
const emailValidate =  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; //邮箱正则
const isChinese = /[\u4e00-\u9fa5]/;//是否包含中文
let imgCodeUrl = config.HOST_LOGIN + '/api/getAuthImage?rnd=';
export default observer(class Login extends Component {

    constructor(props){
        super(props);
        this.state = {
            marginTopStyle: 0,
            errMsg: '',
            userName: '',
            passWord: '',
            check: false,
            isCookie: false,
            // 是否登录
            isLoginLoad: false,

            tabFix: 0,

            // 短信信息
            messageTel: '',
            messageCode: '',
            messsageImgCode: '',
            telClass: 'btn',
            telBtnLabel: '获取验证码',
            imgUrl:  imgCodeUrl + Math.random(),
            // 图形验证码是否验证成功
            sendQR: false,
            //是否发送验证码，
            ifSendQrcode: false,
            //记录获取验证码请求状态，防止多次发送请求
            codeFlag: true,
            telLoad: false,
            telCodeResult: false,

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
                        <div className="login-tab">
                            <h2 className={"login-title " + (this.state.tabFix == 0 && " active")} onClick={()=> {
                                this.setState({
                                    tabFix: 0,
                                    errMsg: '',
                                    messageTel: '',
                                    messsageImgCode: '',
                                    messageCode: ''
                                });
                            }}>短信登录</h2>
                            <h2 className={"login-title " + (this.state.tabFix == 1 && " active")} onClick={()=> {
                                this.setState({
                                    tabFix: 1,
                                    errMsg: ''
                                })
                            }}>密码登录</h2>
                        </div>
                        {this.state.tabFix == 0 ? this.renderMessageLogin() : this.renderLogin()}
                        <div className="btnContainer">
                            <span className="login_btn" disabled={this.state.isLoginLoad}  onClick={this.beginLogin.bind(this)}>{this.state.isLoginLoad ? '登 录 中...' : '登 录'}</span>
                            <a className="login_btn login_btn_white" href={`${config.HOST_OWN}${config.WEIXIN_LOGIN_CODE}?redirect_uri=${redirectUri}`}>
                                <i className="icon-weixin"></i>
                                微信登录
                            </a>
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
                        {this.state.errMsg && (
                            <p className="errorMsg_login">
                                {this.state.errMsg}
                            </p>
                        )}
                    </div>
                </div>
                <Carousel index={this.state.carouselIndex} show={this.state.cookieShow} hide={(index)=>{
                    this.setState({
                        cookieShow: false,
                        carouselIndex: index
                    })
                }}></Carousel>
            </div>
        );
    }
    renderMessageLogin() {
        return (
            <div>
                <div className="aso-formgroup aso-formgroup-login">
                    <input type="text" placeholder="手机号" className="form-control mb15" value={this.state.messageTel} onChange={this.inputFormName.bind(this, 'tel')}/>
                    <div className="form-login-group mb15 clearfix">
                        <input type="text" placeholder="验证码" className="form-control vertify fl" value={this.state.messsageImgCode} onChange={this.inputFormName.bind(this, 'imgcode')}/>
                        <img className="btn_vertify fr" onClick={this.changeImg.bind(this)} title="看不清楚？换一张" src={this.state.imgUrl}/>
                    </div>
                    <div className="form-login-group mb15 clearfix">
                        <input type="text" placeholder="短信验证码" className="form-control vertify fl" value={this.state.messageCode} onChange={this.inputFormName.bind(this, 'telcode')}/>
                        <div className="btn_vertify fr">
                            <a className={this.state.telClass}  onClick={this.getQrocde.bind(this)}>{this.state.telBtnLabel}</a>
                        </div>
                    </div>
                </div>
                <div className="agreement">
                    <div className="remember fl">
                        <span className="agreementLink fl">
                            点击登录即表示已阅读并同意
                            <a className="link-left" href="/agreement" target="_blank">《使用协议》</a>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    renderLogin() {
        return (
            <div>
                <div className="aso-formgroup  aso-formgroup-login">
                    <input ref="username" type="text" placeholder="手机号/邮箱" className="form-control mb15" value={this.state.userName} onChange={this.inputFormName.bind(this, 'name')}/>
                    <input ref="password" type="password" placeholder="密码" className="form-control mb15" value={this.state.passWord} onChange={this.inputFormName.bind(this, 'pass')}/>
                </div>
                <div className="agreement">
                    <div className="remember fl"  onClick={this.changeCheck.bind(this)}>
                        <input type="checkbox" className="fl" checked={this.state.check} readOnly/>
                        <span className="agreementLink fl">30天内自动登录</span>
                    </div>
                    <div className="linkContainer fr">
                        <a className="link-right" href={`/findpass?redirect_uri=${redirectUri}`}>找回密码</a>
                    </div>
                </div>
            </div>
        )
    }
    /**
     * 修改名称和密码
     * @param  {string} type [策略详情，name or id]
     * @param  {Object} e    [当前数据对象]
     */
    inputFormName(type, e) {
        var val = e.target.value;
        if (type === 'name') {
            this.setState({
                userName: val,
                isCookie: false
            });

            if (this.state.check) {
                this.setState({
                    passWord: ''
                });
            }
        }
        else if (type == 'tel') {
            this.setState({
                messageTel: val
            });
        }
        else if (type == 'imgcode') {
            if (val.length == 4) {
                this.checkImgCode(val);
            }
            this.setState({
                messsageImgCode: val
            });
        }
        else if (type == 'telcode') {
            this.setState({
                messageCode: val
            });
        }
        else {
            this.setState({
                passWord: val,
                isCookie: false
            });
        }
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
     * 切换选项
     */
    changeCheck() {
        var check = this.state.check;
        this.setState({
            check: !check
        });
    }
    /**
     * 登录按钮
     */
    checkLogin() {
        var name = this.state.userName;
        var pass = this.state.passWord;
        if (this.state.isLoginLoad) {
            return;
        }
        this.setState({
            errMsg: '',
            isLoginLoad: true
        });
        if (name === '') {
            this.setState({
                errMsg: '账号不能为空',
                isLoginLoad: false
            });
        }
        else if (!phoneValidate.test(name)&&!emailValidate.test(name)) {
            this.setState({
                errMsg: '账号格式不正确',
                isLoginLoad: false
            });
        }
        else if (pass === '') {
            this.setState({
                errMsg: '密码不能为空',
                isLoginLoad: false
            });
        }
        else if ((pass.length < 6 || pass.length > 24) && !this.state.isCookie) {
            this.setState({
                errMsg: '密码在6~24位之间',
                isLoginLoad: false
            });
        }
        else if (isChinese.test(pass)) {
            this.setState({
                errMsg: '密码不能包含中文',
                isLoginLoad: false
            });
        }
        else {
            this.setState({
                errMsg: ''
            });
            Service.loginBase({
                account: name,
                passwd: pass,
                isRemember: this.state.check ? 1 : 0
            }).then((res)=>{
                this.setState({
                    isLoginLoad: false
                });
                if (res.data.status === 200 && res.data.result) {
                    window.location.href = decodeURIComponent(redirectUri);
                }
                else {
                    this.setState({
                        errMsg: res.data.msg
                    });
                }
            }).catch(()=>{
                this.setState({
                    errMsg: '网络连接错误，请重试',
                    isLoginLoad: false
                });
            })
        }
    }
    /*
    * 自动填写email 和 password
    * */
    writeNamePs() {
        Service.getUserCookie({}).then((res)=>{
            if (res.data && res.data.status === 200) {
                let cookieValue = res.data.kc_ac || '';
                if(cookieValue) {
                    let resultList = cookieValue.split("@#@#");
                    this.setState({
                        userName: decodeURI(resultList[0],"utf-8"),
                        passWord: decodeURI(resultList[1],"utf-8"),
                        check: true,
                        isCookie: true
                    });
                }
            }
            else {
                return;
            }
        }).catch(()=>{
            return;
        })
    }

    /**
     *  界面加载之后的动画
     * 
     */
    loginAnimate() {
        var windowHeight = document.documentElement.clientHeight;
        var contentHeight = windowHeight - 124;
        var marginTopStyle  = (contentHeight - 224) / 2.5;
        this.setState({
            marginTopStyle: marginTopStyle
        });
    }

    componentDidMount() {
        this.loginAnimate();
        redirectUri = common.getUrlParams().redirect_uri;
        auth.checkStatus().then((isLogin)=>{
            if (isLogin) {
                window.location.href = decodeURIComponent(redirectUri);;
            }
        });
        // 获取cookie
        this.writeNamePs();
        // 监听按键
        document.addEventListener('keyup',(e) => {
            if (e.keyCode == 13) {
                this.beginLogin();
            }
        });
    }


    beginLogin() {
        if (this.state.tabFix == 0) {
            this.checkMessageLogin();
        }
        else {
            this.checkLogin();
        }
    }
    /**新需求 */
    changeImg() {
        this.setState({
            imgUrl: imgCodeUrl + Math.random(),
            messsageImgCode: ''
        })
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
        var name = this.state.messageTel;
        var icode = this.state.messsageImgCode;
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

    checkMessageLogin() {
        var name = this.state.messageTel;
        var icode = this.state.messsageImgCode;
        var tcode = this.state.messageCode;
        if (this.state.isLoginLoad) {
            return;
        }
        else if (name == '') {
            this.setState({
                errMsg: '手机号不能为空'
            });
        }
        else if (!phoneValidate.test(name)) {
            this.setState({
                errMsg: '手机号格式不正确'
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
    
        else {
            this.setState({
                errMsg: ''
            });   
            if (!this.state.isLoginLoad) {
                this.setState({
                    isLoginLoad: true
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
                            isLoginLoad: true
                        });
                    }
                    else {
                        Service.loginWithPhone(name, tcode).then((res)=>{
                            this.setState({
                                isLoginLoad: false
                            });
                            if (res.data.status === 200) {
                                window.location.href = decodeURIComponent(redirectUri);
                            }
                            else {
                                this.setState({
                                    errMsg: res.data.msg
                                });
                            }
                        }).catch(()=>{
                            this.setState({
                                errMsg: '网络连接错误，请重试',
                                isLoginLoad: false
                            });
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
});

