import React, { Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { Accordion, Panel, Form, Col, ButtonGroup, Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Loading from './Loading';
import Service from '../service';
import {observer} from "mobx-react";
import {extendObservable} from "mobx";
import * as mobx from 'mobx';
import utils from '../utils';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
const objectAssign = require('object-assign');
let ReactToastr = require("react-toastr");
let {ToastContainer} = ReactToastr; // This is a React Element.
let ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

let Swiper = require('../swiper');

class AsoTimeInput extends React.Component {
	render () {
		return (
			<FormControl
				type="text"
				value={this.props.value}
				readOnly
				onChange={(evt)=>{
					this.props.value = evt.target.value}
				}
				onClick={this.props.onClick}
			/>
		)
  	}
}

AsoTimeInput.propTypes = {
  	onClick: PropTypes.func,
  	value: PropTypes.string
};


export default observer(class CurrentRank extends Component {
	constructor(props){
		super(props);
		extendObservable(this, {
			loading: true,
			selectedDate: this.props.date,
			startDate: moment(this.props.date).add(-6, 'days'),
			index: this.props.index,
			rankData: [],
			downloadURL: '',
			dateRange: [],
			dateRangeAll: [],


			// 新需求界面
			dataMonth: [],
			dataHour: [],
			dataNum: [],
			dataLen: 0,

			rankSwiper : {},
			maxTrans: 0,
			rankSwiperTime: 0
		});
		this.loadCurrentRank();
		this.initTime(this.selectedDate);
	}
	initTime(time) {
		this.dateRange = [];
		this.dateRangeAll = [];
		if (moment().format('YYYY-MM-DD') == moment(time).format('YYYY-MM-DD')) {
			let hh = parseInt(moment(time).format('HH'));
			for (var i = hh + 1; i < 24; i++) {
				this.dateRange.push(i);
				this.dateRangeAll.push(moment(time).add(-1,'day').format('YYYY-MM-DD') + '#' + i);
			}
			for (var i = 0; i <= hh + 10; i++) {
				this.dateRange.push(i);
				this.dateRangeAll.push(moment(time).format('YYYY-MM-DD') + '#' + i);
			}
		}
		else {
			for (var i = 0; i < 24; i++) {
				this.dateRange.push(i);
				this.dateRangeAll.push(moment(time).format('YYYY-MM-DD') + '#' + i);
			}
		}
	}
	componentDidUpdate() {
		let that = this;
		this.rankSwiper = new Swiper('.swiper-container-' + this.index, {
			slidesPerView: 'auto',
			resistanceRatio : 0,
			grabCursor: true,
			initialSlide: this.dataMonth.length - 1,
			longSwipesRatio : 0.05,
			freeMode: true,
			on: {
				init: function () {
					that.maxTrans = this.getTranslate() || 0;
				}
			}
		});
	}
	initData() {
		this.dataMonth = [];
		this.dataHour = [];
		this.dataNum = [];
		this.dataLen  = 0;
		if (this.rankData.length) {
			// 先存储年月日 和小时
			let dataMonth = [];
			let data = this.rankData[0].rank;
			for (var i = 0; i < data.length; i++) {
				this.dataMonth.push(data[i].time);
				dataMonth.push([]);
				let dataH = data[i].data;
				let arr = [];
				for (var j = 0; j < dataH.length; j++) {
					arr.push(dataH[j].split('#')[0]);
					this.dataLen++;
				}
				this.dataHour.push(arr);
			}
			// 存储小时地址
			
			for (var i = 0; i < this.rankData.length; i++) {
				let dataI = this.rankData[i].rank;
				for (var j = 0; j < dataI.length; j++) {
					let dataN = dataI[j].data;
					
					let arrN = [];
					for (var k = 0; k < dataN.length; k++) {
						arrN.push(dataN[k].split('#')[1]);
					}
					dataMonth[j].push(arrN);
				}
			}
			this.dataNum = dataMonth;
		}
	}
	render() {
		return (
			<div className="aso-rank-box"> 
				<div className="aso-row clearfix aso-rank-box__head">
					<div className="col-8">
						<Form horizontal className="aso-formhorizontal">
							<FormGroup className="aso-formgroup">
								<Col md={3} sm={3} lg={3} xs={3} className="aso-padding-r">
									<DatePicker maxDate={moment()}
												dateFormat="YYYY-MM-DD"
												selected={this.startDate}
												onChange={(date)=>{ 
													let mix = moment(date).add(+90, 'days').unix(Number) - moment(this.selectedDate).unix(Number);
													if (mix < 0) {
														this.refs.container.warning("", "时间查询范围不能超过90天，建议您分多次查询！", {
															timeOut: 3000,
															extendedTimeOut: 0,
															showAnimation: 'animated fadeInDown',
															hideAnimation: 'animated fadeOutUp',
														});
														date = moment(this.selectedDate).add(-90, 'days');
													}
													this.startDate = date;
													this.loading = true;
													this.loadCurrentRank();
												}}
												customInput={<AsoTimeInput />} 
									/>
								</Col>
								<Col componentClass={ControlLabel} md={1} sm={1} lg={1} xs={1} style={{textAlign: 'center'}}>至</Col>
								<Col md={3} sm={3} lg={3} xs={3} className="aso-padding-r">
									<DatePicker maxDate={moment()}
												minDate={this.startDate}
												dateFormat="YYYY-MM-DD"
												selected={this.selectedDate}
												onChange={(date)=>{ 
													let mix = moment(date).add(-90, 'days').unix(Number) - moment(this.startDate).unix(Number);
													if (mix > 0) {
														this.refs.container.warning("", "时间查询范围不能超过90天，建议您分多次查询！", {
															timeOut: 3000,
															extendedTimeOut: 0,
															showAnimation: 'animated fadeInDown',
															hideAnimation: 'animated fadeOutUp',
														});
														date = moment(this.startDate).add(+90, 'days');
													}
													this.selectedDate = date;
													this.loading = true;
													this.loadCurrentRank();
												}}
												customInput={<AsoTimeInput />} 
									/>
								</Col>			
							</FormGroup>
						</Form>
					</div>
					<div className="col-4 text-right">
						<a onClick={this.exportCurrentRank.bind(this)} className="export-btn"><i className="aso-icon-export"></i><span>导出数据</span></a>
					</div>
				</div>
				{this.loading ? <Loading show={true}/> :(
					<div>
						<div className="col-1 rank-list-left">
							<div className="rank-list-head-time">
								关键词
							</div>
							{this.rankData.map((val,ii) => {
								return (
									<div className="rank-list-head-item" title={val.keyword}  key={`key-${ii}`}>
										{val.keyword}
									</div>
								);
							})}
							
						</div>
						<div className="col-11 rank-list-right">
							<div className={"swiper-container swiper-container-"+ this.index}>
								<div className="swiper-wrapper">
									{this.dataMonth.map((inner, ii) => {
										return (
											<div className="swiper-slide" key={`key-${ii}`}>
												<div className="rank-list-head-time">
													<div className="rank-list-head-time-top">{inner}</div>
													<div className="rank-list-head-time-bottom">
														{this.dataHour[ii].map((innerH, iiH) => {
															return (
																<div className="item" key={`key-${iiH}`} style={{width: Math.max(888 / this.dataLen, 37)}}>
																	{iiH}点
																</div>
															)
														})}
													</div>
												</div>
												
												{this.dataNum[ii].map((innerN, iiN) => {
													return (
														<div className="content-item"  key={`key-${iiN}`}>
															{innerN.map((innerNM, iiNM) => {
																return (
																	<div  className={"item " +  (innerNM <= this.props.rank ? " reach" : "")}  key={`key-${iiNM}`} title={innerNM=='-'?'无排名':'排名' + innerNM} style={{width: Math.max(888 / this.dataLen, 37)}}>
																		{innerNM}
																	</div>
																)
															})}
														</div>
													)
												})}
											</div>
										)
									})}
								</div>
							</div>
							<div className="swiper-button-prev" title="上一页"  onMouseDown={this.changePage.bind(this, 'prev')} onMouseUp={() => {
								clearInterval(this.rankSwiperTime);
							}} onMouseOut={() => {
								clearInterval(this.rankSwiperTime);
							}}></div>
							<div className="swiper-button-next" title="下一页"  onMouseDown={this.changePage.bind(this, 'next')} onMouseUp={() => {
								clearInterval(this.rankSwiperTime);
							}} onMouseOut={() => {
								clearInterval(this.rankSwiperTime);
							}}></div>
							<div style={{height:30}} className="clearfix"></div>
						</div>
					</div>
				)}
				<ToastContainer ref="container"
	                        	toastMessageFactory={ToastMessageFactory}
	                        	className="toast-top-right" />
			</div>
		);
	}
	exportCurrentRank() {
		Service.exportCurrentRank(this.props.entityId, this.startDate.format("YYYY-MM-DD"), this.selectedDate.format("YYYY-MM-DD"), this.props.type).then((res)=>{
			if (res.data.status === 200 && res.data.fileUrl) {
				utils.downloadFile(res.data.fileUrl);
			}
		})
	} 
	loadCurrentRank() {
		Service.getCurrentRank(this.props.entityId, this.startDate.format("YYYY-MM-DD"), this.selectedDate.format("YYYY-MM-DD"), this.props.type).then((res)=>{
			if (res.data.status === 200 && res.data.data) {
				this.rankData = res.data.data;
				this.initData();
			}
			this.loading = false;
		}).catch(()=>{
			this.loading = false;
		});
	}

	changePage(type, e) {
		this.transItem(type);
		this.rankSwiperTime = setInterval(() => {
			this.transItem(type);
		}, 200);
	}
	transItem (type) {
		let trans = this.rankSwiper.getTranslate();
		if (type == 'prev') {
			trans = Math.min(trans + 37, 0);
		}
		else {
			trans = Math.max(trans - 37, this.maxTrans);
		}
		this.rankSwiper.setTransition(300);
		this.rankSwiper.setTranslate(trans);
	}
});
