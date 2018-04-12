import React, { Component } from 'react';
import Service from '../service';

const POLL_T = 1000;
let timePay;
export default class Footer extends Component {
	constructor(props){
		super(props);
		this.state = {
			qrcode: null
		}
		this.isSchemePay = this.props.match.params.tradeType === 'scheme';
		this.loadQRCode();
		this.pollIsPay();
	}
	render() {
		return (
			<div className="aso-wxpay">
				<div className="aso-container">
					<div className="text-center aso-wxpay__content">
						<img src="http://cdn.coolguang.com/public/66aso/images/pay_left.png"/>
						<div>
							<p className="text-center aso-wxpay__title">
								请使用微信 <br/>
								扫描二维码进行支付
							</p>
							<img src={this.state.qrcode} alt="微信支付" width="200" height="200" />
						</div>
					</div>
					<p className="text-center aso-wxpay__footer">请您尽快完成支付，以便能够顺利的发起任务</p>
				</div>
			</div>
		);
	}

	loadQRCode(){
		Service.getQRCode(this.props.match.params.tradeType, this.props.match.params.tradeNo, this.props.match.params.useAssets).then((res)=>{
			if (res.data.status === 200) {
				this.setState({
					qrcode: `data:image/jpg;base64,${res.data.img}`
				})
			}
		})
	}

	// 轮询是否支付
	pollIsPay(){
		Service.checkIsPay(this.props.match.params.tradeNo, this.props.match.params.tradeType).then((res)=>{
			if (res.data.status === 200) {
				clearTimeout(timePay);
				var url = window.location.origin+'/successPay?schemeId=' + (res.data.schemeId || 0) + '&appId=' + (res.data.appId || 0) + '&money=' + res.data.fee + '&orderType=' + res.data.orderType;
				window.location.href = url;
			}
			else {
				timePay = setTimeout(this.pollIsPay.bind(this), POLL_T);
			}
		}).catch(()=>{
			timePay = setTimeout(this.pollIsPay.bind(this), POLL_T);
		})
	}
}
