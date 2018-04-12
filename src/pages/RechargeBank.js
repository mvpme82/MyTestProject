import React, { Component } from 'react';
import {observer} from "mobx-react";
import mobx,{extendObservable, computed} from "mobx";
import { Modal , Button} from 'react-bootstrap';

export default observer(class RechargeBank extends Component {
	constructor(props){
        super(props);
        this.state = {
            bankType: 1,
            cardType: 1
        }
		extendObservable(this,{
            payWay: 1,
            showWechatPayModal: false
  		});
	}
	render() {
		return (
			<div className="aso-payment">
                <section className="aso-container">
                    <div className="pay-body pay-body-recharge" style={{padding: '13px 20px'}}>
                        <div className="pay-body-form">
                            <label className="pay-form-label">商品订单：</label>
                            <span className ="pay-form-span">15057042838</span>
                        </div>
                        <div className="pay-body-form">
                            <label className="pay-form-label">实付金额：</label>
                            <span className ="pay-form-h3">￥8,000.00</span>
                        </div>
                        <div className="pay-line"></div>
                        <div className="pay-body-form">
                            <label className="pay-form-label">银行类型：</label>
                            <div className ="pay-form-radio">
                                <label className="radio-wrapper radio-wrapper-checked">
                                    <span className="radio-icon"></span>
                                    <span>个人银行</span>
                                </label>
                                <label className="radio-wrapper">
                                    <span className="radio-icon"></span>
                                    <span>企业银行</span>
                                </label>
                            </div>
                        </div>
                        <div className="pay-body-form">
                            <label className="pay-form-label">选择银行：</label>
                            <div className ="pay-form-list pay-way">
                                <dd  className={this.payWay === 1 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                                <dd  className={this.payWay === 2 && "active"}><img height="38" src={require('../images/icbc-min.png')}/></dd>
                            </div>
                        </div>
                        <div className="pay-body-form">
                            <label className="pay-form-label">选择卡种：</label>
                            <div className ="pay-form-radio">
                                <label className="radio-wrapper radio-wrapper-checked">
                                    <span className="radio-icon"></span>
                                    <span>储蓄卡</span>
                                </label>
                                <label className="radio-wrapper">
                                    <span className="radio-icon"></span>
                                    <span>信用卡</span>
                                </label>
                            </div>
                        </div>
                        <Button  style={{marginTop: 60}} bsClass="btn" bsStyle="primary" className="aso-style pay-btn fixed-width-btn" onClick={this.toPayRecharge.bind(this)}>立即支付</Button>
                    </div>  
                </section>
                <Modal show={this.showWechatPayModal}>
					<Modal.Body>
						<div className="text-center">
							<img src={this.wechatPayImage}/>
						</div>
						<div className="text-center">请使用微信扫码充值</div>
					</Modal.Body>
					<Modal.Footer>
						<Button className="aso-style" onClick={this.confirmPayStatus.bind(this)} bsStyle="primary">支付完成</Button>
						<Button onClick={this.confirmPayStatus.bind(this)}>遇到了问题</Button>
					</Modal.Footer>
				</Modal>
			</div>
		);
	}
    bankChange = (e) => {
        this.setState({
            bankType: e.target.value,
        });
    }
    cardChange = (e) => {
        this.setState({
            cardType: e.target.value,
        });
    }
    /**
     * 点击充值按钮
     * 
     */
    toPayRecharge() {
        this.newWindow = window.open("about:blank",'_blank');
		this.newWindow.document.title = "创建订单";
        this.newWindow.document.body.innerHTML = '<img src="http://cdn.coolguang.com/public/66aso/images/loading.gif" style="margin:120px auto;display:block;height:230px;"/>';
        this.showWechatPayModal = true;
        this.newWindow.location.href = window.location.origin+'/successPay?schemeId=10&appId=10&money=100&orderType=recharge';
    }

    confirmPayStatus() {
        
    }
})
