import React, { Component, PropTypes} from 'react';
import { Accordion, Panel, Form, Col, ButtonGroup, Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Loading from './Loading';
import Service from '../service';
import {observer} from "mobx-react";
import {extendObservable, computed} from "mobx";
import * as mobx from 'mobx';
import utils from '../utils';
import moment from 'moment';
import 'moment/locale/zh-cn';
import InputNumber from 'rc-input-number';
moment.locale('zh-cn');
class AsoTimeInput extends React.Component {
  	render () {
		return (
			<FormControl
				type="text"
				readOnly
				value={this.props.value}
				onChange={(evt)=>{this.props.value = evt.target.value}}
				onClick={this.props.onClick}
			/>
    	)
  	}
}

AsoTimeInput.propTypes = {
  	onClick: PropTypes.func,
  	value: PropTypes.string
};


export default observer(class RecentRank extends Component {
  	constructor(props){
		super(props);
		extendObservable(this, {
			loading: true,
			selectedDate: moment(),
			rankData: [],
			downloadURL: '',
			type: this.props.type,
			orderType: this.props.orderType,
			dateRange: this.createDateRange(moment()),
			successRates: computed(() => {
				let rates = [],
					reachs = {};
				if (this.rankData.length) {
					this.rankData.forEach((v1) => {
						v1.rankData.forEach((v2, index)=>{ // 1-7天
							if (v2.effectiveNum > this.rankLeavel) {
								reachs[index] = reachs[index] ? (reachs[index]+1) : 1
							}
						});
					});
				}
				for (let i =  0; i < 7; i++) {
					rates.push(reachs[i] ? reachs[i] : 0);
				}
				return rates;
			}),
			rankLeavel: this.props.rankLeavel
		});
		utils.getRealTime().then((time)=>{
			this.selectedDate = time;
			this.dateRange = this.createDateRange(this.selectedDate);
			this.loadRecentRank();
		});
  	}
	componentWillReceiveProps(nextProps){
		this.rankLeavel = nextProps.rankLeavel;
    }
  	render() {
		return (
			<div className="aso-rank-box"> 
				<div className="aso-row clearfix aso-rank-box__head">
					<div className="col-4">
						<Form horizontal className="aso-formhorizontal">
							<FormGroup className="aso-formgroup">
								<Col md={6} sm={6} className="aso-padding-r">
									<DatePicker maxDate={moment()}
												dateFormat="YYYY-MM-DD"
												selected={this.selectedDate}
												onChange={(date) => { 
													this.selectedDate = date;
													this.loading = true;
													this.loadRecentRank();
												}}
												customInput={<AsoTimeInput />} 
									/>
								</Col>
							</FormGroup>
						</Form>
					</div>
					<div className="col-8 text-right">
						<a onClick={this.exportRecentRank.bind(this)} className="export-btn"><i className="aso-icon-export"></i><span>导出数据</span></a>
					</div>
				</div>
				{this.loading ? <Loading show={true}/> :(
					<div>
						<div className="aso-row aso-col-8 rank-list-head successTa"  style={{padding:"0 20px"}}>
							<div className="GJC">关键词</div>
							{this.dateRange.map((val,ii) => {
								return (
									<div className="cursor-pointer " title={moment(val).format('MM月DD日')} onClick={this.seeTodayRank.bind(this,ii)} key={`key-${ii}`}>
										{moment(val).format('MM月DD日')}
									</div>
								);
							})}
						</div>
						<div className="aso-row aso-col-8 rank-list-head successTa " style={{paddingLeft:20,paddingRight:20, paddingBottom:10}}>
							<div></div>
							{this.successRates.map((val, key) => {
								return (
									<div key={key}>{val}/{this.rankData.length}</div>
								)
							})}
						</div>
						{this.rankData.map((val, index) => {
							return (
								<div className="aso-row aso-col-8 rank-list-item" key={`key-${index}`} style={{padding:"0 20px"}}>
									<div title = {val.keyword}>{val.keyword}</div>
									{val.rankData.map((iv, ii) => {
											let reachClass = "no-reach";
											if (iv.effectiveNum > this.rankLeavel) {
													reachClass = "reach";
											}
											if (iv.reachNum > this.rankLeavel && iv.effectiveNum < this.rankLeavel) {
													reachClass = "part-reach";
											}
											if (iv.reachNum < this.rankLeavel) {
													reachClass = "no-reach";
											}
											return <div onClick={this.seeTodayRank.bind(this,ii)}
														className={reachClass + " cursor-pointer"} 
														key={`key-${ii}`}>{iv.reachNum}</div>
									})}
								</div>
							);
						})}
						{(this.orderType != '4' && this.type != 'monitor') ? (
							<div className="rank-rule-wrapper"></div>
						) : (
							<div className="rank-rule-wrapper">
								<span><span className="reach-dot"></span>已达标：6:00以后在榜时间超过{this.rankLeavel}小时</span>
								<span><span className="part-reach-dot"></span>部分达标：6:00以后在榜时间未超过{this.rankLeavel}小时</span>
								<span><span className="no-reach-dot"></span>不达标：全天在榜时间未超过{this.rankLeavel}小时</span>
								<div className="pull-right rank-num">
									到榜要求
									<InputNumber 
										precision={0} 
										min={1} 
										max={9} 
										formatter={(input)=> {
											if (!/^[0-9]{1,}$/.test(input)) {
												return 5;
											}
											if (input > 9) {
												return 9;
											}
											if (input < 1) {
												return 1;
											}
											return input;
										}}
										value={this.rankLeavel} 
										onChange={(value)=>{
											if (!/^[0-9]{1,}$/.test(value)) {
												value = 5;
											}
											value = Math.max(1, value);
											value = Math.min(9, value);
											this.rankLeavel = value;
											this.props.onChange && this.props.onChange(value);
										}}/>
									小时
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		);
  	}

	seeTodayRank(index){
		this.props.onSelect && this.props.onSelect(this.dateRange[index]);
	}
	exportRecentRank(){
		Service.exportRecentRank(this.props.entityId, this.selectedDate.format("YYYY-MM-DD"), this.props.type).then((res)=>{
			if (res.data.status === 200 && res.data.fileUrl) {
				utils.downloadFile(res.data.fileUrl);
			}
		})
	} 

	createDateRange(date) {	
		date = moment(date);
		var range = [];
		range.push(date.format('YYYY-MM-DD'));
		for (let i = 1; i <= 6; i++) {
			let day = date.subtract(1, 'day').format('YYYY-MM-DD');
			range.unshift(day);
		}
		return range;
	}
	loadRecentRank(){
		Service.getRecentRank(this.props.entityId, this.selectedDate.format("YYYY-MM-DD"), this.props.type).then((res) => {
			if (res.data.status === 200 && res.data.data) {
				this.rankData = res.data.data;
			}
			this.dateRange = this.createDateRange(this.selectedDate.format('YYYY-MM-DD'));
			this.loading = false;
		}).catch(()=>{
			this.loading = false;
		})
	}
});