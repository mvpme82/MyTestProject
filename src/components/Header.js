import React, { Component } from 'react';
import {ButtonGroup, Button} from 'react-bootstrap';
import {NavLink} from 'react-router-dom';
import {observer} from "mobx-react";
import {extendObservable,observable,autorun} from "mobx";
import config from '../config';
import auth from '../auth';
import Service from '../service';
import Common from '../common';
const queryString = require('query-string');

const Header = observer(class HeaderComponent extends Component {
    constructor(props){
        super(props);
        extendObservable(this,{
            className: "",
            isHomeRoute: false,
            loginClassName: 'login-group'
        });
    }

    render() {
        return (
            <header className={ "aso-header " + this.className }>
      	        <nav className="aso-container aso-nav clearfix"> 
                    <div className="logo pull-left">
                        <NavLink to="/">
                            {/* <img alt="" height="64" src='http://cdn.coolguang.com/public/66aso/images/logo-w.gif'/> */}
                            {!this.isHomeRoute ? <img height="64" alt="" src="http://cdn.coolguang.com/public/66aso/images/logo-b.gif"/> : (headerDelegate.activeHeader ? <img alt="" height="64" src='http://cdn.coolguang.com/public/66aso/images/logo-b.gif'/> : <img alt="" height="64" src='http://cdn.coolguang.com/public/66aso/images/logo-w.gif'/>)}
                        </NavLink>
                    </div>
      		          <ul className="list-unstyled clearfix">
                        <li className="pull-left aso-nav__item">
                            <NavLink className="aso-link" exact activeClassName="aso-nav__item--active" to="/">首页</NavLink>
                        </li>
                        <li className="pull-left aso-nav__item">
                            <NavLink className="aso-link" exact activeClassName="aso-nav__item--active" to="/schemes">ASO方案</NavLink>
                        </li>    
                        <li className="pull-left aso-nav__item">
                            <NavLink className="aso-link"  activeClassName="aso-nav__item--active" to="/charts">竞争指数</NavLink>
                        </li> 
                        <li className="pull-left aso-nav__item">
                            <NavLink className="aso-link"  activeClassName="aso-nav__item--active" to="/assurance">担保交易</NavLink>
                        </li> 
                        <li className="pull-left aso-nav__item">
                            <NavLink className="aso-link" exact activeClassName="aso-nav__item--active" to="/join">商家入驻</NavLink>
                        </li>
                    </ul>
                    {auth.isAuthorized() ? (
                        <div className={"pull-right " + this.loginClassName}>
                            <div className="aso-link-group">
                                <a onClick={this.enterDashboard.bind(this)}>管理中心</a>
                                <a onClick={this.logout.bind(this)}>退出</a>
                            </div>
                        </div>) : (
                        <div className={"pull-right aso-nav__btn-group " + this.loginClassName}>
                            <Button className="aso-style first" onClick={this.login.bind(this)} bsStyle="primary">登录</Button>
                            {/* <ButtonGroup>
                                <Button onClick={this.login.bind(this)} className="first">登录</Button>
                            </ButtonGroup> */}
                        </div>
                    )}
                    {!this.isHomeRoute ? this.renderSearch() : (headerDelegate.activeHeader ? this.renderSearch() : null)}
                </nav>
            </header>
        );
    }
    login() {
        auth.checkStatus().then((isLogin)=>{
            if (isLogin) {
                window.location.href = decodeURIComponent(this.baseURL());
            }
            else {
                window.location.href = config.LOGIN_URL + '?redirect_uri=' + this.baseURL();
            }
        });
    }
    register() {
        auth.checkStatus().then((isLogin)=>{
            if (isLogin) {
                window.location.href = decodeURIComponent(this.baseURL());
            }
            else {
                window.location.href = config.REGISTER_URL + '?redirect_uri=' + this.baseURL();
            }
        });
    }



    baseURL() {
        var redirectUrl = this.getParam('redirect_uri');
        if (window.location.pathname.indexOf('/schemes') >= 0 && Common.getCookie('categoryId') > 0) {
            redirectUrl =  encodeURIComponent(window.location.origin + '/schemes?categoryId=' + Common.getCookie('categoryId'));
        }
        else  if (!redirectUrl) {
            redirectUrl = encodeURIComponent(window.location.href);
        }
        else {
            redirectUrl = encodeURIComponent(redirectUrl);
        }
        return redirectUrl;
    }
    enterDashboard() {
        this.props.history.push('/dashboard/monitors');
    }
  
    logout() {
        Service.logout({
            isRedirect: 0
        }).then((res) => {
            window.location.href = `${config.HOST_LOGIN}${config.LOGIN_OUT}?redirect_uri=${encodeURIComponent(window.location.origin)}`;
        });
    }
    renderSearch() {
        return (
            <div className="pull-right" style={{marginRight:16}}>
                <form className="aso-nav__search" onSubmit={this.enterSearch.bind(this)}>
                    <input ref="keyword" placeholder="66aso，排名优化666！"/>
                    <span onClick={this.enterSearch.bind(this)}>
                        <i className="aso-icon-search"></i>
                    </span>
                </form>
            </div>
        );
    }

    componentWillMount() {
        this.checkHomeRoute();
    }
    componentDidMount() {
        this.toggleHeaderClass();
        this.props.history.listen(this.toggleHeaderClass.bind(this));
        setTimeout(() => {
            this.loginClassName = 'login-group-show'
        }, 500);
    }
    toggleHeaderClass(evt) {
        if (this.props.history.location.pathname === '/') {
            this.delegate && this.delegate();
            this.delegate = autorun(() => {
                if (headerDelegate.activeHeader) {
                    this.className = "";
                }
                else {
                    this.className = "aso-header--transparent";
                }
            });
        }
        let className = "";
        if (this.props.history.location.pathname === '/') {
            className = "aso-header--transparent";
        }
        this.className = className;
        this.checkHomeRoute();
    }
    enterSearch(evt) {
        evt.preventDefault();
        let kw = this.refs.keyword.value.trim();
        if (kw.length) {
            if ((/^[0-9]+$/).test(kw)) {
                Service.checkAppId(kw).then((res) => {
                    if (res.data.status === 200 && res.data.isAppId) {
                        const parsed = queryString.parse(this.props.location.search);
                        var openfrom = parsed.openfrom ? Number(parsed.openfrom) : this.props.location.openfrom; 
                        var path =   `${window.location.origin}/appdetail/${kw}`;
                        if (Number(openfrom) === 1){
                            path = path + '/open/order'
                        }
                        else if (Number(openfrom) !== 0){
                            path = path + '/open/monitor'
                        }
                        window.location.href = path;
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
    }

    goSearchPage(kw) {
        this.props.history.push(`/search/${kw}?openfrom=1`);
    }

    checkHomeRoute() {
        this.isHomeRoute = this.props.history.location.pathname === '/';
    }
    
    getParam(name) {
        var Locationurl;
        Locationurl = window.location.href;
        var r = new RegExp('(\\?|#|&)' + name + '=([^&#]*)(&|#|$)');
        var m = Locationurl.match(r);
        return m ? decodeURIComponent(m[2]) : null;
    }
});

export const headerDelegate = observable({
   activeHeader: false,
});

export default Header;


