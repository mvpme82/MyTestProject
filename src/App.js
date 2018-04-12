import React, { Component } from 'react';
import '../node_modules/react-datepicker/dist/react-datepicker.min.css';
import './styles/swiper.css';
import './App.css';
import './styles/animate.min.css';
import './styles/react-toastr.css';
import './styles/login.css';
import './styles/chart.css';
import 'rc-input-number/assets/index.css';
import 'rc-time-picker/assets/index.css';

// 引入js组件
import Header from './components/Header';
import Footer from './components/Footer';
import FixTop from './components/FixTop';
import Home from './pages/Home';
import Search from './pages/Search';
import successPay from './pages/successPay';
import Join from './pages/Join';
import Plans from './pages/Plans';
import AppDetail from './pages/AppDetail';
import SchemeDetail from './pages/SchemeDetail';
import Payment from './pages/Payment';
import BankPayment from './pages/BankPayment';
import Recharge from './pages/Recharge';
import RechargeBank from './pages/RechargeBank';
import auth from './auth';
import config from './config';
import Dashboard from './pages/dashboard/Dashboard';
import Assets from './pages/dashboard/Assets';
import Monitors from './pages/dashboard/Monitors';
import Schemes from './pages/dashboard/Schemes';
import Orders from './pages/dashboard/Orders';
import Assurances from './pages/dashboard/Assurances';
import WxPay from './pages/WxPay';
import Charts from './pages/Charts';
import ChartResult from './pages/ChartResult';
import Assurance from './pages/Assurance';
import AssuranceDetail from './pages/AssuranceDetail';
import AssurancePayment from './pages/AssurancePayment';
// 登录注册找回密码
import Login from './pages/Login';
import Register from './pages/Register';
import Findpass from './pages/Findpass';
import Agreement from './pages/Agreement';
import WxCodeLogin from './pages/WxCodeLogin';

import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';
import { withRouter } from 'react-router';



const HeaderWithRouter = withRouter(Header);
const ScrollToTop =  withRouter(class ScrollToTop extends Component {
    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            window.scrollTo(0, 0)
        }
    }
    render() {
        return this.props.children
    }
});

// 路由异步代理组件
class AuthoriztionDelegate extends Component{
    constructor(props){
        super(props);
        // 检测登录状态 针对未登录或在购买页刷新网页时 因为登录状态监测是异步的
        // 直接跳转
        auth.checkStatus().then((isLogin)=>{
            if (isLogin) {
                this.props.history.replace(this.props.location.pathname);
            }
            else {
                window.location.href = config.LOGIN_URL + '?redirect_uri=' + encodeURIComponent(window.location.href);
                return <div></div>;
            }
        });
    }
    render(){   
        return null;
    }
}


const subroutepaths = ['/dashboard/assets', '/dashboard/schemes', '/dashboard/monitors', '/dashboard/orders', '/dashboard/assurances'];
const dashboardSubRoutes = [{
    path: '/dashboard/assets',
    render: (props)=>{
        return <Assets {...props}/>
    },
    exact:true
},
{
    path: '/dashboard/schemes',
    render: (props)=>{
        return <Schemes {...props}/>
    },
    exact:true
},
{
    path: '/dashboard/monitors',
    render: (props)=>{
        return <Monitors {...props}/>
    },
    exact:true
},
{
    path: '/dashboard/orders',
    render: (props)=>{
        return <Orders {...props}/>
    },
    exact:true
},
{
    path: '/dashboard/assurances',
    render: (props)=>{
        return <Assurances {...props}/>
    },
    exact:true
}];


class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            showFix: false
        }
    }
    render() {
        return (
            <Router>
                <ScrollToTop>
                    <div id="aso-router">
                        <HeaderWithRouter />
                        <Switch>
                            <Route exact path="/" component={Home}/>
                            <Route strict path="/search/:keyword" component={Search}/>
                            <Route path="/join" component={Join}/>
                            <Route path="/schemes" component={Plans}/>
                            <Route path="/successPay" component={successPay}/>
                            <Route path="/appdetail/:appId/open/:type" component={AppDetail}/>
                            <Route path="/appdetail/:appId" component={AppDetail}/>
                            <Route exact path="/charts" component={Charts}/>
                            <Route path="/charts/result" component={ChartResult}/>
                            <Route exact path="/assurance" component={Assurance}/>
                            <Route path="/assurance/search/:keyword" render={(props)=>{
                                return <Search {...props} type="assurance"/>
                            }}/>
                            <Route path="/assurance/detail/:appId" component={AssuranceDetail}/>
                            {/*担保充值*/}
                            <Route exact path="/assurance/pay/:tradeNo/:encryptionStr" render={(props)=>{
                                return <AssurancePayment {...props}/>
                            }}/>
                            <Route exact path="/assurance/info/:tradeNo/:encryptionStr" render={(props)=>{
                                return <AssurancePayment {...props} type="info"/>
                            }}/>


                            {/*登录-注册-找惠密码*/}
                            <Route path="/login" component={Login}/>
                            <Route path="/register" component={Register}/>
                            <Route path="/findpass" component={Findpass}/>
                            <Route path="/wxlogin" component={WxCodeLogin}/>
                            {/*协议*/}
                            <Route path="/agreement" component={Agreement}/>
                            <Route path="/bankpayment" component={BankPayment}/>
                            {/* 受保护的路由 需要登录才可访问 */}
                            <Route path="/schemedetail/:schemeId" render={(props)=>{
                                if (auth.isAuthorized()) {
                                    return <SchemeDetail {...props}/>
                                }
                                else {
                                    return <AuthoriztionDelegate {...props}/>
                                }
                            }}/>

                            {/*方案购买*/}
                            <Route path="/schemepay/:schemeId/:tradeNo" render={(props)=>{ 
                                if (auth.isAuthorized()) {
                                    return <Payment {...props} type="schemepay"/>
                                }
                                else {
                                    return <AuthoriztionDelegate {...props}/>
                                }
                            }}/>

                            {/*优化关键词购买*/}
                            {/* <Route exact path="/optimizepay/:appId/:schemeId/:taskType/:channelId/:expectRank/:optimizeDatetime/:keywords/:tradeNo" render={(props)=>{ */}
                            <Route exact path="/optimizepay/:appId/:schemeId/:taskType/:channelId/:expectRank/:optimizeDatetime/:tradeNo" render={(props)=>{
                                if (auth.isAuthorized()) {
                                    return <Payment {...props} type="optimizepay"/>
                                }
                                else {
                                    return <AuthoriztionDelegate {...props}/> 
                                } 
                            }}/>
                            {/*个人充值*/}
                            <Route exact path="/recharge" render={(props)=>{
                                if (auth.isAuthorized()) {
                                    return <Recharge {...props}/>
                                }
                                else {
                                    return <AuthoriztionDelegate {...props}/>
                                }
                            }}/>
                            <Route path="/recharge/bank" render={(props)=>{
                                if (auth.isAuthorized()) {
                                    return <RechargeBank {...props}/>
                                }
                                else {
                                    return <AuthoriztionDelegate {...props}/>
                                }
                            }}/>
                            {/*用户管理中心*/}
                            <Route strict path="/dashboard" render={(props)=> {  
                                let pname = props.location.pathname;
                                if (subroutepaths.indexOf(pname) < 0) {
                                    return <Redirect push to="/"/>
                                }             
                                if (auth.isAuthorized()) {
                                    return <Dashboard {...props} routes={dashboardSubRoutes}/>
                                }
                                else {
                                    return <AuthoriztionDelegate {...props}/> 
                                }
                            }}/>

                            <Route strict path="/wxpay/:tradeType/:tradeNo/:useAssets" render={(props)=> {     
                                return <WxPay {...props}/>
                                {/* if (auth.isAuthorized()) {
                                    return <WxPay {...props}/>
                                }
                                else {
                                    return <AuthoriztionDelegate {...props}/>
                                } */}
                            }}/>
                            <Redirect to="/"/>
                        </Switch>
                        <Footer />
                        <FixTop />
                    </div>
                </ScrollToTop>
            </Router>
        );
    }
    componentDidMount(){
        //检查登录状态
        auth.checkStatus();
        // 滑动的时候吸顶
        window.onscroll =  event => {
            let tab = document.getElementsByClassName('aso-thead-wrap')[0];
            let wrapper = document.getElementsByClassName('aso-thead')[0];
            let sTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
            // 导航吸顶
            if (wrapper && wrapper.offsetTop) {
                let result = wrapper.offsetTop - sTop;
                let className = tab.getAttribute('class');
                if (result <= 64) {
                    if (className.indexOf('fixed') < 0) {
                        className = className.concat(' fixed')
                    }
                }
                else {
                    className = className.replace('fixed', '');
                }
                tab.setAttribute('class', className);
            }
        };
    }
}
export default App;
