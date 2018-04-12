import React, { Component } from 'react';
import {observer} from "mobx-react";
import mobx,{extendObservable, computed} from "mobx";
import { Modal , Button} from 'react-bootstrap';
import Service from '../service';
// 引入登录弹框功能
import OfflinePay from '../components/OfflinePay';

var ReactToastr = require("react-toastr");
var {ToastContainer} = ReactToastr; // This is a React Element.
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);
let bankUrl = 'http://66aso.kuchuan.com/bankpayment';
// let bankUrl = `${window.location.origin}/bankpayment`;

export default observer(class Recharge extends Component {
	constructor(props){
		super(props);
		extendObservable(this,{
			priceType: [{
                type: 1,
                price: '5000'
            }, {
                type: 2,
                price: '8000'
            }, {
                type: 3,
                price: '10000'
            }, {
                type: 4,
                price: '20000'
            }, {
                type: 5,
                price: '其他金额'
            }],
            pricePay: 5000,
            priceTag: 1,
            priceBlur: false,
            payWay: 1,
            baseModalShow: false,
            orderEntity: {},

            paying: false, // 正在支付
			payError: false,
			showConfirmModal: false,
        });
        this.createMyOrder();  
	}
	render() {
		return (
			<div className="aso-payment">
                <section className="aso-container">
                    <div className="pay-body pay-body-recharge">
                        <div className="pay-way">
                            <dt>充值金额</dt>
                            {this.priceType.map((val, ii) => {
                                return (
                                    <div className={"price-tag " + (this.priceTag == val.type && "active")}  key={`key-${ii}`} onClick={()=>{
                                            if (val.type == 5) {
                                                this.priceBlur = true;
                                            }
                                            else {
                                                this.priceBlur = false;
                                                this.priceType[4].price = '其他金额';
                                            }
                                            this.priceTag = val.type;
                                            switch(+val.type) {
                                                case 1:
                                                    this.pricePay = 5000;
                                                break;
                                                case 2:
                                                    this.pricePay = 8000;
                                                break;
                                                case 3:
                                                    this.pricePay = 10000;
                                                break;
                                                case 4:
                                                    this.pricePay = 20000;
                                                break;
                                                case 5:
                                                    this.pricePay = '';  
                                                break;
                                            }
                                        }}
                                    >
                                        {(!this.priceBlur || val.type != 5) && this.showPirce(val.price)}
                                        {(this.priceBlur && val.type == 5) && (
                                            <form onSubmit={this.otherPirce.bind(this)}>
                                                <input defaultValue={val.price == '其他金额' ? '' : val.price}  autoFocus={true} ref="price" placeholder="输入金额" onBlur={this.otherPirce.bind(this)}/>
                                            </form>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pay-way">
                            <dt>线下汇款</dt>
                            <dd onClick={()=>{this.payWay = 7; this.baseModalShow = true;}} className={this.payWay === 7 && "active"}><img height="50" src={require('../images/icbc-min.png')}/></dd>
                        </div>
                        <div className="pay-way">
							<dt>在线支付</dt>
							<dd onClick={()=>{this.payWay = 1;}} className={this.payWay === 1 && "active"}><img height="32" src={require('../images/alipay-min.png')}/></dd>
							<dd onClick={()=>{this.payWay = 2;}} className={this.payWay === 2 && "active"}><img height="32" src={require('../images/weixinpay-min.png')}/></dd>
                            <dd onClick={()=>{this.payWay = 6;}} className={this.payWay === 6 && "active"}><img height="32" src={require('../images/bank-min.png')}/></dd>
						</div>
                        <Button  style={{marginTop: 60}}  disabled={this.pricePay <= 0 || this.pricePay >= 1000000} bsClass="btn" bsStyle="primary" className="aso-style pay-btn fixed-width-btn" onClick={this.toPayRecharge.bind(this)}>立即充值</Button>
                    </div>  
                </section>
                <ToastContainer ref="container"
	                        	toastMessageFactory={ToastMessageFactory}
	                        	className="toast-top-right" />
                <Modal show={this.showConfirmModal}>
					<Modal.Body>
						<h4>是否完成了购买？</h4>
						<p>请在打开的页面中完成充值，充值完成后，请根据充值的结果点击下面的按钮</p>
					</Modal.Body>
					<Modal.Footer>
						<Button className="aso-style" onClick={this.confirmPayStatus.bind(this)} bsStyle="primary">支付完成</Button>
						<Button onClick={this.confirmPayStatus.bind(this)}>遇到了问题</Button>
					</Modal.Footer>
				</Modal>
                <OfflinePay hide={()=>{ this.baseModalShow = false; }}  showModal = {this.baseModalShow} onChange={(data)=>{
    
                }}/>
			</div>
		);
	}
    showPirce(price) {
        // 校验金额
        if (isNaN(price)) {
            return price;
        }
        let pattern = /(?=((?!\b)\d{3})+$)/g;
        price = price.toString();
        let newPrice = price.split('.');

        return (newPrice[1] ? newPrice[0].replace(pattern, ',') + '.' + newPrice[1] : newPrice[0].replace(pattern, ',')  )  + '元';
    }
    otherPirce(evt) {
        // 其他金额
        evt && evt.preventDefault();
        let num = this.refs.price.value || 0;
        if (isNaN(num) || num <= 0) {
            num = 0;
        }
        if (num >= 1000000) {
            this.toast('充值金额必须小于100万');
            num = 999999;
        }
        if (num.toString().indexOf('.') >= 0) {
            num = parseFloat(num).toFixed(2);
        }
        this.priceType[4].price = num;
        this.pricePay = num;
        this.priceBlur = false;
    }

    /**
     * 点击充值按钮
     * 
     */
    toPayRecharge() {
        if (this.payWay == 7) {
            this.baseModalShow = true;
        }
        else {
            this.paying = true;
            this.newWindow = window.open("about:blank",'_blank');
            if (this.payWay !== 6) {
                this.newWindow.document.title = "创建订单";
                this.newWindow.document.body.innerHTML = '<img src="http://cdn.coolguang.com/public/66aso/images/loading.gif" style="margin:120px auto;display:block;height:230px;"/>';
            }
        }
        let params = {
            tradeNo: this.orderEntity.tradeNo,
            payType: this.payWay,
            money: +this.pricePay
        }
        Service.createMyPay(params).then((response)=>{
            if (response.data.status === 200) {
                if (this.payWay === 7) {
                    return;
                }
                if (this.payWay === 1) {
					this.newWindow.location.href = response.data.data.data;
				}
				else if (this.payWay === 6){
					this.newWindow.location.href = bankUrl + '?url=' + encodeURIComponent(response.data.data.data);
				}
                else {
                    this.newWindow.location.href = `${window.location.origin}/wxpay/recharge/${this.orderEntity.tradeNo}/0`;
                }
                this.showConfirmModal = true;
            }
            else {
                this.showConfirmModal = false;
                this.newWindow.close();  
                this.toast(response.data.msg);
            }
            this.paying = false;
        }).catch(()=>{
            this.paying = false;
            this.showConfirmModal = false;
            this.newWindow.close();
        });
        
    }
    checkIsPay() {
		return new Promise((resolve, reject)=>{
			Service.checkIsPay(this.orderEntity.tradeNo, 'recharge').then((res)=>{
				if (res.data.status === 200) {
					resolve();
				} else {
					reject();
				}
			}).catch(()=>{
				reject();
			})
		});
    }
    toast(error, type = 'warning') {
        this.refs.container[type]("", error || "支付失败", {
            timeOut: 3000,
            extendedTimeOut: 0,
            showAnimation: 'animated fadeInDown',
            hideAnimation: 'animated fadeOutUp',
        });
    }
    confirmPayStatus() {
        this.checkIsPay().then(()=>{
			window.opener && window.opener.location.reload();
			this.showConfirmModal = false;
			this.props.history.push('/dashboard/assets');
		}).catch(()=>{
            this.showConfirmModal = false;
            this.toast('支付失败');
        });
    }
    createMyOrder(){
		Service.createMyOrder({}).then((res)=>{
			if (res.data.status === 200 && res.data.data) {
				this.orderEntity = res.data.data;
			}
		});
    }
})
