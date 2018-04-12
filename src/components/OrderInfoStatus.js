import React, { Component, PropTypes} from 'react';
import { Accordion, Panel, Form, Col, ButtonGroup, Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import {observer} from "mobx-react";
import {extendObservable, computed} from "mobx";
import Loading from './Loading';
import Service from '../service';
import * as mobx from 'mobx';
import utils from '../utils';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

export default observer(class OrderInfoStatus extends Component {
  	constructor(props){
		super(props);
		extendObservable(this, {
			status: [{
				createTime: 0,
				orderStatus: 0,
				name: "创建订单"
			}, {
				createTime: 0,
				orderStatus: 0,
				name: "支付成功"
			}, {
				createTime: 0,
				orderStatus: 0,
				name: "执行订单"
			}, {
				createTime: 0,
				orderStatus: 0,
				name: "确认订单"
			}, {
				createTime: 0,
				orderStatus: 0,
				name: "交易完成"
			}],
			realStatus: [],
			loading: true
		});
		this.assuranceLog();
  	}
  	render() {
		return (
			<div className="aso-rank-box"> 
				{!this.loading && (
					<div>
						<div className="stepflex clearfix">
							{this.status.map((val, index)=>{
								return (
									<dl className={"normal " + (val.createTime > 0 && "active ") + (index  == 0 && "first ")  + (index  == this.status.length - 1 && " four last")} key={index} >
										<dt className="s-num">
											<b></b>
										</dt>
										<dd className="s-text">{val.name}</dd>
										{val.createTime > 0 && (
											<dd className="s-time">{moment(val.createTime).format('YYYY.MM.DD')}</dd>
										)}
									</dl>				
								)
							})}
							<div className="step-process">
								<div className="step-process-len" style={{width: Math.min(12.5 + (this.realStatus.length - 1) * 25, 100) + '%'}}></div>
							</div>
						</div>
					</div>
				)}
				<Loading show={this.loading}/>
			</div>
		);
	}
	assuranceLog(val){
		Service.assuranceLogs({
			tradeNo: this.props.entityId
		}).then((res) => {
            if (res.data.status == 200) {
				this.realStatus = res.data.data;
				for (let i = 0; i < this.realStatus.length; i++) {
					this.status[i] = this.realStatus[i];
				}
				this.loading = false;
            }
		});
    }
});