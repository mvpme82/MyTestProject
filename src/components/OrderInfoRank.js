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
moment.locale('zh-cn');
export default observer(class OrderInfoRank extends Component {
  	constructor(props){
		super(props);
		extendObservable(this, {
			info: this.props.entityData
		});
		
  	}
	componentWillReceiveProps(nextProps){
		this.info = nextProps.entityData;
    }
  	render() {
		return (
			<div className="aso-rank-box aso-rank-box-new"> 
				<div className="aso-row clearfix aso-rank-box__head">
					<div className="col-4">
						<Form horizontal className="aso-formhorizontal">
							<FormGroup className="aso-formgroup">
								<Col componentClass={ControlLabel} md={7} sm={7}>服务类型： {['快速安装任务', '排重安装任务', '激活任务', '注册任务', '保排名任务'][this.info.channelType]}</Col>
							</FormGroup>
						</Form>
					</div>
					<div className="col-8 text-right">
						<a onClick={this.exportOrderInfoRank.bind(this)} className="export-btn"><i className="aso-icon-download1"></i><span>下载明细</span></a>
					</div>
				</div>
				<div className="aso-thead" style={{padding: '0 24px'}}>
					<div  className={"aso-row  aso-col-3 " + (this.info.channelType != 4 && " aso-col-4")}>
						<div className="text-center">
							关键词
						</div>
						<div className="text-center">
							热度
						</div>
						<div className="text-center">
							当前排名
						</div>
						{this.info.channelType != 4 && (
							<div className="text-center">
								购买量(全天)
							</div>
						)}
					</div>
				</div>
				{this.info.keywordInfos && this.info.keywordInfos.map((val, index)=>{
					return (
						<div key={index} className={"aso-row aso-col-3 optimize-keyword-row " + (this.info.channelType != 4 && " aso-col-4")}>
							<div style={{color: val.initRank == '-' && '#ff2b45'}}>{val.keyword}</div>
							<div>{val.initHot}</div>
							<div title={val.initRank == '-'? '未覆盖': val.initRank}>{val.initRank}</div>
							{this.info.channelType != 4 && (
								<div>{val.buyDownload}</div>
							)}
						</div>						
					)
				})}
				
			</div>
		);
  	}
	exportOrderInfoRank(){
		Service.exportOrderInfo({
			tradeNo: this.info.tradeNo
		}).then((res)=>{
			if (res.data.status === 200 && res.data.fileUrl) {
				utils.downloadFile(res.data.fileUrl);
			}
		})
	}
});