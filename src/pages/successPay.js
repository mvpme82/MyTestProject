import React, { Component } from 'react';
import Service from '../service';

export default class successPay extends Component {
    constructor(props){
        super(props);
        this.state = {
            show: this.props.show
        }
    }

    componentWillReceiveProps(nextProps){
        this.setState({
            show: nextProps.show
        })
    }

    render() {
        var appId = Service.getParam('appId');
        var schemeId = Service.getParam('schemeId');
        var id='';
        var url='';
        var url1='';
        var money=Service.getParam('money');
        var orderType=Service.getParam('orderType');

        var msg = '';
        if (orderType=='scheme') {
            if (appId == 'undefined' || appId == '0'){
                msg = '执行方案';
                url='/schemedetail/'+schemeId;
            }
            if (appId != 'undefined' && appId != '0'){
                msg = '执行方案';
                url='/appdetail/'+appId+'/open/scheme';
            }
            url1='/dashboard/schemes';
        }
        else if (orderType == 'assets') {
            msg = '查看充值记录';
            url='/dashboard/assets';
        }
        else if (orderType == 'assurance') {
            // 不处理
        }
        else {
            if (schemeId == '0'){
                msg = '继续下单';
                url='/appdetail/'+appId+'/open/order';
            }
            if (schemeId != '0'){
                msg = '继续下单';
                url='/appdetail/'+appId+'/open/scheme';
            }
            url1='/dashboard/orders';
        }
        return ( 
            <div className="text-center successPayContant"> 
                <dl>
                    <dd><img src={require('../images/success.png')} height="68"/></dd>
                    <dd className="payDesc">您已成功付款</dd>
                    <dd className="payCont">实付款：￥{money}</dd>
                    {orderType != 'assurance' && (
                        <dd className="doGo">
                            您可以 <a href={url} className="goCheme goA">{msg}</a>
                            {orderType != 'assets' && (
                                <a  href={url1}  className="detail goA" >查看订单详情</a>
                            )}
                        </dd>
                    )}
                </dl>
            </div>
        );
    }

    doScheme(val){
        window.open(`${window.location.origin}/${val}`); 
    }
}