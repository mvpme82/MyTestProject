import React, { Component, PropTypes} from 'react';
import { Accordion, Panel, Form, Col, ButtonGroup, Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Loading from './Loading';
import Service from '../service';
import {observer} from "mobx-react";
import {extendObservable, computed} from "mobx";
import * as mobx from 'mobx';
import utils from '../utils';
export default observer(class Remark extends Component {
  	constructor(props){
		super(props);
		extendObservable(this, {
			value: this.props.value || ''
		});
  	}
	componentWillReceiveProps(nextProps){
		this.value = nextProps.value || '';
    }
  	render() {
		return (
			<div className="aso-remark-box"> 
				<FormGroup className="aso-formgroup">
                    <FormControl value={this.value} onChange={(evt)=>{
                        let val = evt.target.value.trim(); //去除空格检查
                        this.value = val;
                    }}
                    componentClass="textarea"  placeholder="请输入备注信息" />
                </FormGroup>
				<div className="aso-remark-btn">
					<Button onClick={() => {
						this.props.onClick && this.props.onClick({
							value: this.value,
							action: 'ok'
						});
					}} bsClass="btn" bsStyle="primary" className="aso-style">修改</Button>
					<Button onClick={() => {
						this.props.onClick && this.props.onClick({
							action: 'cancel'
						});
					}} bsClass="btn"  className="aso-style">取消</Button>
				</div>
			</div>
		);
	}
	
	updateRemark() {
		
	}
});