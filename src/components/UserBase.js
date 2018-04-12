import React, { Component } from 'react';
import {observer} from "mobx-react";
import mobx,{extendObservable} from "mobx";
import Service from '../service';
import { Button, Modal} from 'react-bootstrap';
import Loading from './Loading';
import Carousel from './form-component/carousel';
// 公共方法
import common from '../common';
import config from '../config';
var interval;
const cookieKey = '68f04b2cb36d263908f74c889f6189aa';
const imgCodeUrl = config.HOST_LOGIN + '/api/getAuthImage?rnd=';
const phoneValidate = /^1[3|4|5|7|8]\d{9}$/; //手机号正则
const emailValidate =  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; //邮箱正则
const isChinese = /[\u4e00-\u9fa5]/;//是否包含中文

// 该方法适用于弹框登录-注册-找回密码等功能
export default observer(class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: this.props.showModal,
            type: this.props.showType || 'login',
            mTop: this.showVertical(),

            lcheck: false,
            rcheck: true,
            errMsg: '',
            isCookie: false,

            // 登录信息
            userName: '',
            passWord: '',
            telPhone: '',
            // 是否登录
            isLoginLoad: false,
            // 注册信息
            surePassWord: '',
            imgCode: '',
            imgCodeOldCode: '',    // 点击发送验证码的时候，存储
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
            registerFlag: true,
            registerLabel: '注册',

            // 找回密码
            //记录请求设置新密码 请求状态，防止多次发送请求***先为true方便测试，加上请求后要改为false
            newPwdOk: true,
            nextFlag: true,
            //记录请求设置新密码 请求状态，防止多次发送请求***先为true方便测试，加上请求后要改为false
            updateFlag: true,

            // 切换登录
            tabFix: 0,
            cookieShow: false,

            hasCookie: window.navigator.cookieEnabled,
            carouselIndex: 0
        }
    }
    componentWillReceiveProps(nextProps){
        this.setState({
            show: nextProps.showModal,
            type: nextProps.showType || 'login',
            mTop: this.showVertical(),
            errMsg: ''
        });
        if (nextProps.showType === 'login' && nextProps.showModal) {
            this.writeNamePs();
        }
        else {
            this.setState({
                userName: '',
                passWord: '',
                imgCode: '',
                telCode: ''
            });
        }
    }
    componentDidMount() {
        document.addEventListener('keyup',(e) => {
            if (e.keyCode == 13) {
                this.handleKeyDown();
            }
        });
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
                        lcheck: true,
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
    close() {
        this.props.hide && this.props.hide();
    }
    /**
     * 监听按键事件
     * 
     */
    handleKeyDown() {
        if (this.state.show) {
            switch (this.state.type) {
                case 'login':
                    this.beginLogin();
                break;
                case 'regist':
                    this.checkRegister();
                break;
                case 'findpass':
                    this.nextFind();
                break;
            }
        }
    }
    showVertical(type = 'login') {
        var h = 0;
        switch (type) {
            case 'login':
                h = 409;
            break;
            case 'regist':
                h = 429;
            break;
            case 'findpass':
                h = 300;
            break;
        }
        return  (document.documentElement.clientHeight - h) / 2 - 30;
    }
    /*================公共方法================ */
    /**
     * 切换modal的类型
     * 
     * @param {string} type  modal类型， 有login ,regist, findpass
     */
    changeType(type = 'login') {
        this.setState({
            type: type,
            mTop: this.showVertical(type),
            errMsg: ''
        });
        window.clearInterval(interval);
        if (type === 'login') {
            this.setState({
                userName: '',
                passWord: '',
                lcheck: false,
                imgCode: '',
                telCode: ''
            });
            this.writeNamePs();
        }
        else {
            this.setState({
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
                newPwdOk: true,
                sendQR: false,
                ifSendQrcode: false,
                codeFlag: true,
                registerFlag: true,
                registerLabel: '注册',
               //记录请求设置新密码 请求状态，防止多次发送请求***先为true方便测试，加上请求后要改为false
                updateFlag: true,
                newPwdOk: true,
                nextFlag: true
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
        var self = this;
        this.setState({
            isCookie: false
        });
        switch (type) {
            case 'name':
                this.setState({
                    userName: value
                });
                if (this.state.lcheck  && this.state.type == 'login') {
                    this.setState({
                        passWord: ''
                    });
                }
            break;
            case 'pass':
                this.setState({
                    passWord: value
                });
                if (value.length > 5 && this.state.type == 'findpass') {
                    this.checkOld(value, (res) => {
                        if (res.status == '200' && res.result) {
                            // 不能与旧密码相同"
                            this.setState({
                                errMsg: '不能与旧密码相同',
                                newPwdOk: false
                            });
                        }
                        else {
                            this.setState({
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
                if (value.length >= 4 || this.state.telLoad) {
                    this.checkImgCode(value);
                }
                this.setState({
                    imgCode: value
                });
            break;
            case 'tel':
            console.log(value);
                this.setState({
                    telPhone: value
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
     * 验证新密码是否和老密码一直
     * 
     * @param {string} pass  新密码
     * @param {Function} cb 回调函数 
     */
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
    /**
     * 校验图片二维码是是否正确
     * @param  {string} type [策略详情，name or id]
     * @param  {Object} e    [当前数据对象]
     */
    checkImgCode(val) {
        Service.imgCode(val.toUpperCase()).then((res)=>{
            if (res.data.result) {
                this.setState({
                    errMsg: '',
                    sendQR: true,
                    imgCodeOldCode: val
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
    getQrocde(type) {
        if (this.state.telLoad) {
            return;
        }
        var self = this;
        var name = (type == 'message') ? this.state.telPhone : this.state.userName;
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
        else {
            this.setState({
                errMsg: '',
                imgCodeOldCode: icode
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
                                errMsg: res.data.msg,
                                telClass: 'btn',
                                telLoad: false,
                                telBtnLabel: '重新发送'
                            });
                            window.clearInterval(interval);
                        }
                    });
                }
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
        interval= window.setInterval(() => {
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
     * 切换图片验证码
     * 
     */
    changeImg() {
        var imgUrl = imgCodeUrl + Math.random();
        this.setState({
            imgUrl: imgUrl,
            imgCode: ''
        })
    }
    

    /*================私有方法================ */
    /**
     *  登录界面，check按钮切换
     * 
     */
    changeLoginCheck() {
        var lcheck = this.state.lcheck;
        this.setState({
            lcheck: !lcheck
        });
    }
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
                isRemember: this.state.lcheck ? 1 : 0
            }).then((res)=>{
                if (res.data.status === 200 && res.data.result) {
                    this.setState({
                        isLoginLoad: false
                    });
                    if (this.props.onChange) {
                        this.props.onChange({
                            status: 100
                        });
                    }
                }   
                else {
                    this.setState({
                        errMsg: res.data.msg,
                        isLoginLoad: false
                    });
                }
            }).catch((res)=>{
                this.setState({
                    errMsg: '网络连接错误，请重试',
                    isLoginLoad: false
                });
            })
        }

    }
    checkMessageLogin() {
        var name = this.state.telPhone;
        var icode = this.state.imgCode;
        var tcode = this.state.telCode;
        var ocode = this.state.imgCodeOldCode;
        console.log(this.state.sendQR , icode, ocode);
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
        else if (!this.state.sendQR || icode != ocode) {
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
            Service.loginWithPhone(name, tcode).then((res)=>{
                if (res.data.status === 200) {
                    this.setState({
                        isLoginLoad: false
                    });
                    if (this.props.onChange) {
                        this.props.onChange({
                            status: 100
                        });
                    }
                }   
                else {
                    this.setState({
                        errMsg: res.data.msg,
                        isLoginLoad: false
                    });
                }
            }).catch((res)=>{
                this.setState({
                    errMsg: '网络连接错误，请重试',
                    isLoginLoad: false
                });
            }) 
        }
    }
    beginLogin() {
        if (this.state.tabFix == 0) {
            this.checkMessageLogin();
        }
        else {
            this.checkLogin();
        }
    }

    /**
     *  登录界面，check - 注册按钮切换
     * 
     */
    changeCheck() {
        var rcheck = this.state.rcheck;
        this.setState({
            rcheck: !rcheck
        });
    }
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
        else if (surepass.length < 6 || surepass.length > 24) {
            this.setState({
                errMsg: '确认密码在6~24位之间'
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
                    registerLabel: '注册中...'
                }); 
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
                    //注册成功
                    if(res.data.result){
                        if (this.props.onChange) {
                            this.props.onChange({
                                status: 100
                            });
                        }
                    }
                    else{
                        this.setState({
                            errMsg: res.data.msg,
                            registerLabel: '注册'
                        });
                    }
                });
            }
        }
    }

    /**
     * 找回密码
     */
    nextFind() {
        if (this.state.nextFlag) {
            this.nextFindFirst();
        }
        else {
            this.nextFindSecond();
        }
    }
    /**
     *  第一步
     * 
     */
    nextFindFirst() {
        var name = this.state.userName;
        var icode = this.state.imgCode;
        var tcode = this.state.telCode;
        if (!this.state.nextFlag) {
            return;
        }
        else if (name == '') {
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
    /**
     *  第二步
     * 
     */
    nextFindSecond() {
        var self=this;
        var name = this.state.userName;
        var pass = this.state.passWord;
        if (this.state.nextFlag) {
            return;
        }
        else if (pass == '') {
            this.setState({
                errMsg: '新密码不能为空'
            });
        }
        else if (pass.length < 6 || pass.length > 24) {
            this.setState({
                errMsg: '新密码在6~24位之间'
            });
        }
        else if (isChinese.test(pass)) {
            this.setState({
                errMsg: '新密码不能包含中文'
            });
        }
        else {
            this.setState({
                errMsg: ''
            });

            this.checkOld(pass, (res) => {
                if (res.status == '200' && res.result) {
                    // 不能与旧密码相同"
                    this.setState({
                        errMsg: '不能与旧密码相同"',
                        newPwdOk: false
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
                                // 找回成功
                                if (this.props.onChange) {
                                    this.props.onChange({
                                        status: 100
                                    });
                                }
                            }
                        }).catch(()=>{
                            this.setState({
                                errMsg: '网络连接错误，请重试'
                            });
                        });
                    }
                }
            })
        }
    }
    render() {
        return (
            <Modal backdrop="static" dialogClassName="base-modal" show={this.state.show}  onHide={this.close.bind(this)} style={{paddingTop: this.state.mTop + 'px'}}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-sm">
                        {this.state.type == 'login' && (
                            <div className="login-tab login-tab-base">
                                <label className={this.state.tabFix == 0 && " active"} onClick={()=> {
                                    this.setState({
                                        tabFix: 0,
                                        errMsg: '',
                                        telPhone: '',
                                        imgCode: '',
                                        telCode: ''
                                    })
                                }}>短信登录</label>
                                <label className={this.state.tabFix == 1 && " active"} onClick={()=> {
                                    this.setState({
                                        tabFix: 1,
                                        errMsg: ''
                                    })
                                }}>密码登录</label>
                            </div>
                        )}
                        {this.state.type == 'regist' && (
                            <label>注册</label>
                        )}
                        {this.state.type == 'findpass' && (
                            <div className="login-tab login-tab-center"><label className="active">{this.state.nextFlag ? '找回密码' : '设置新密码'}</label></div>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/*登录*/}
                    <div className="container_login">
                        {this.state.type == 'login' && (
                            <div className="login">
                                {this.state.tabFix == 0 ?   this.renderMessageLogin() : this.renderLogin()}
                                <div className="btnContainer">
                                    <span className="login_btn" disabled={this.state.isLoginLoad}  onClick={this.beginLogin.bind(this)}>{this.state.isLoginLoad ? '登 录 中...' : '登 录'}</span>
                                    <span className="login_btn login_btn_white" onClick={()=>{
                                        window.location.href =`${config.HOST_OWN}${config.WEIXIN_LOGIN_CODE}?redirect_uri=${window.location.href}`; 
                                    }}><i className="icon-weixin"></i>微信登录</span>
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
                            </div>
                        )}
                        {this.state.type == 'regist' && (
                            this.renderRegister()
                        )}
                        {this.state.type == 'findpass' && (
                            this.renderFind()
                        )}
                        {this.state.errMsg && (
                            <p className="errorMsg_login">
                                {this.state.errMsg}
                            </p>
                        )}
                    </div>
                </Modal.Body>
                <Carousel index={this.state.carouselIndex} show={this.state.cookieShow} hide={(index)=>{
                    this.setState({
                        cookieShow: false,
                        carouselIndex: index
                    })
                }}></Carousel>
          </Modal>
        );
    }
    renderMessageLogin() {
        return (
            <div>
                <div className="aso-formgroup aso-formgroup-login">
                    <input type="text" placeholder="手机号" className="form-control mb15" value={this.state.telPhone} onChange={this.inputFormName.bind(this, 'tel')}/>
                    <div className="form-login-group mb15 clearfix">
                        <input type="text" placeholder="验证码" className="form-control vertify fl" value={this.state.imgCode} onChange={this.inputFormName.bind(this, 'imgcode')}/>
                        <img className="btn_vertify fr" onClick={this.changeImg.bind(this)} title="看不清楚？换一张" src={this.state.imgUrl}/>
                    </div>
                    <div className="form-login-group mb15 clearfix">
                        <input type="text" placeholder="短信验证码" className="form-control vertify fl" value={this.state.telCode} onChange={this.inputFormName.bind(this, 'telcode')}/>
                        <div className="btn_vertify fr">
                            <a className={this.state.telClass} disabled={!this.state.sendQR}  onClick={this.getQrocde.bind(this, 'message')}>{this.state.telBtnLabel}</a>
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
    /**
     * 登录的主体样式
     */
    renderLogin() {
        return (
            <div>
                <div className="aso-formgroup  aso-formgroup-login">
                    <input ref="username" type="text" placeholder="手机号/邮箱" className="form-control mb15" value={this.state.userName} onChange={this.inputFormName.bind(this, 'name')}/>
                    <input ref="password" type="password" placeholder="密码" className="form-control mb15" value={this.state.passWord} onChange={this.inputFormName.bind(this, 'pass')}/>
                </div>
                <div className="agreement">
                    <div className="remember fl"  onClick={this.changeLoginCheck.bind(this)}>
                        <input type="checkbox" className="fl" checked={this.state.lcheck} readOnly/>
                        <span className="agreementLink fl">30天内自动登录</span>
                    </div>
                    <div className="linkContainer fr">
                        <a className="link-right" onClick={this.changeType.bind(this, 'findpass')}>找回密码</a>
                    </div>
                </div>
            </div>
        )
    }


    /**
     * 注册的主体样式
     */
    renderRegister() {
        return (
            <div className="register">
                <div className="aso-formgroup aso-formgroup-login">
                    <input type="text" placeholder="手机号" className="form-control mb15" value={this.state.userName} onChange={this.inputFormName.bind(this, 'name')}/>
                    <input type="password" placeholder="密码" className="form-control mb15" value={this.state.passWord} onChange={this.inputFormName.bind(this, 'pass')}/>
                    <input type="password" placeholder="确认密码" className="form-control mb15" value={this.state.surePassWord} onChange={this.inputFormName.bind(this, 'passsure')}/>

                    <div className="form-login-group mb15 clearfix">
                        <input type="text" placeholder="验证码" className="form-control vertify fl" value={this.state.imgCode} onChange={this.inputFormName.bind(this, 'imgcode')}/>
                        <img className="btn_vertify fr" onClick={this.changeImg.bind(this)} title="看不清楚？换一张" src={this.state.imgUrl}/>
                    </div>
                    <div className="form-login-group mb15 clearfix">
                        <input type="text" placeholder="短信验证码" className="form-control vertify fl" value={this.state.telCode} onChange={this.inputFormName.bind(this, 'telcode')}/>
                        <div className="btn_vertify fr">
                            <a className={this.state.telClass} disabled={!this.state.sendQR}  onClick={this.getQrocde.bind(this)}>{this.state.telBtnLabel}</a>
                        </div>
                    </div>
                </div>
                <div className="agreement">
                    <div className="remember fl" onClick={this.changeCheck.bind(this)}>
                        <input type="checkbox" className="fl" checked={this.state.rcheck} readOnly/>
                        <span className="agreementLink fl">
                            同意网站的
                            <a className="link-left" href="/agreement" target="_blank">《使用协议》</a>
                        </span>
                    </div>
                </div>
                <div className="btnContainer">
                    {this.state.rcheck && (
                        <span className="login_btn" disabled={!this.state.registerFlag} onClick={this.checkRegister.bind(this)}>{this.state.registerLabel}</span>
                    )}
                    {!this.state.rcheck && (
                        <span className="login_btn login_btn_disabled">注 册</span>
                    )}
                    <p className="loginLink loginLink-pa">
                        已有账号，<a className="link" onClick={this.changeType.bind(this, 'login')}>立即登录</a>
                    </p>
                </div>
            </div>
        )
    }
    /**
     * 找回密码的主体样式
     */
    renderFind() {
        return (
            <div className="findpass">
                {this.state.nextFlag && (
                    <div className="find-pass-first">
                        <div className="aso-formgroup aso-formgroup-login">
                            <input type="text" placeholder="手机号/邮箱" className="form-control mb15" defaultValue={this.state.userName} onChange={this.inputFormName.bind(this, 'name')}/>
                            <div className="form-login-group mb15 clearfix">
                                <input type="text" placeholder="验证码" className="form-control vertify fl" value={this.state.imgCode} onChange={this.inputFormName.bind(this, 'imgcode')}/>
                                <img className="btn_vertify fr" onClick={this.changeImg.bind(this)} title="看不清楚？换一张" src={this.state.imgUrl}/>
                            </div>
                            <div className="form-login-group mb15 clearfix">
                                <input type="text" placeholder="验证码" className="form-control vertify fl" value={this.state.telCode} onChange={this.inputFormName.bind(this, 'telcode')}/>
                                <div className="btn_vertify fr">
                                    <a className={this.state.telClass} disabled={!this.state.sendQR}  onClick={this.getQrocde.bind(this)}>{this.state.telBtnLabel}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {!this.state.nextFlag && (
                    <div className="find-pass-second">
                        <div className="aso-formgroup aso-formgroup-login">
                            <input type="password" placeholder="密码" className="form-control mb15" value={this.state.passWord} onChange={this.inputFormName.bind(this, 'pass')}/>
                        </div>
                    </div>
                )}
                
                <div className="btnContainer">
                    <span className="login_btn login_btn_le_0" onClick={this.nextFind.bind(this)}>{this.state.nextFlag ? '下一步' : '确 定'}</span>
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
            </div>
        )
    }
});