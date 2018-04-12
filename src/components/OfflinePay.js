/**
 * 线下交易
 */
import React, { Component } from 'react';
import {observer} from "mobx-react";
import mobx,{extendObservable} from "mobx";
import { Button, Modal} from 'react-bootstrap';

export default observer(class OfflinePay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: this.props.showModal,
            mTop: this.showVertical(),
            orderNo: this.props.orderNo || ''
        }
    }
    componentWillReceiveProps(nextProps){
        this.setState({
            show: nextProps.showModal,
            mTop: this.showVertical(),
            orderNo: nextProps.orderNo || ''
        });
    }
    showVertical() {
        var h = 466;
        return  (document.documentElement.clientHeight - h) / 2 - 30;
    }
    close() {
        this.props.hide && this.props.hide();
    }
    render() {
        return (
            <Modal backdrop="static" dialogClassName="base-recharge-modal" show={this.state.show}  onHide={this.close.bind(this)} style={{paddingTop: this.state.mTop + 'px'}}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-sm">汇款信息</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="tips">
                        请根据下面银行信息进行充值或付款，在汇款备注中填写充值账号及订单号，务必在充值成功后48小时内联系我们进行到账处理！（在关闭汇款信息后，在页面上点击创建订单以便我们为您生成订单）
                    </p>
                    {this.state.orderNo !== '' && (
                        <div className="tips-order">
                            订单号：{this.state.orderNo}
                        </div>
                    )}
                    <div className="bank-info">
                        <div className="bank-info-header">
                            <img height="50" style={{marginTop: -4}} src={require('../images/icbc-min.png')}/>
                        </div>
                        <div className="bank-info-body">
                            <p>
                                <label>开户名称：</label>  
                                <span>北京酷传科技有限公司</span> 
                            </p>
                            <p>
                                <label>开户银行：</label>  
                                <span>中国工商银行股份有限公司北京马甸支行</span> 
                            </p>
                            <p>
                                <label>汇款账号：</label>  
                                <span>0200025609200052311</span> 
                            </p>
                            <p>
                                <label>汇款备注： </label>  
                                <span>充值账号 xxx</span> 
                            </p>
                        </div>
                    </div>
                    <div className="btnContainer">
                        <span className="login_btn login_btn_le_0" onClick={this.close.bind(this)}>确认</span>
                    </div>
                </Modal.Body>
          </Modal>
        );
    }
});