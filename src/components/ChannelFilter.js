import React, { Component, PropTypes} from 'react';
import { Accordion, Panel, Form, Col, ButtonGroup, Button, FormGroup, ControlLabel,Checkbox,FormControl, Overlay, Popover, OverlayTrigger} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import * as mobx from 'mobx';
import {observer} from "mobx-react";
import {extendObservable} from "mobx";
import TimePicker from 'rc-time-picker';
import utils from '../utils';
import ReactDOM from 'react-dom';
import FormSelect from './form-component/select';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

const checkLabel = ['快速安装', '排重安装', '激活任务', '注册任务', '保排名任务'];
const rankSelect = [{
    index: 1,
    value: 'TOP1'
}, {
    index: 3,
    value: 'TOP3'
}, {
    index: 5,
    value: 'TOP5'
}, {
    index: 10,
    value: 'TOP10'
}];
class AsoTimeInput extends React.Component {
    render () {
        return (
            <FormControl
                type="text"
                value={this.props.value}
                readOnly
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

const CPopover = React.createClass({
    getInitialState() {
        return {
            show: false 
        };
    },

    render() {
        const sharedProps = {
            show: this.state.show,
            container: this,
            target: () => ReactDOM.findDOMNode(this.refs.target)
        };
        return (
            <div style={{display: 'inline-block', position: 'relative'}}  ref="target" onMouseOver={()=>{
                this.setState({
                  show: true
                })
            }} onMouseOut={()=>{
                this.setState({
                    show: false
                }) 
            }}>
                <img style={{verticalAlign: -1, marginLeft: 10, cursor: 'pointer', height: 13, display: 'inline-block', width: 13}} src={require('../images/question.png')}></img>
                <Overlay {...sharedProps} placement="top">
                    <Popover id="popover-positioned-top">
                        {
                            ['适用于未大量投放过积分墙的客户，方便快捷，不需要技术对接，最终以平台提供IDFA数据为结算标准', 
                             '适用于在其他平台投放过积分墙的客户，排除掉在其他平台做过任务的积分用户，提升投放效果，最终以平台提供IDFA数据为结算标准', 
                             '因IOS10限制问题，实际投放快速安装及排重安装任务量会与最终统计后台统计到的激活用户有一定的误差，适用于比较在意积分墙用户是否激活的客户，最终以实际激活量为结算标准',
                             '引导积分墙用户搜索优化关键词-下载-联网打开激活-注册，最终以实际注册量为结算标准',
                             '一口价保效果，不到不收钱'][this.props.taskId]}
                    </Popover>
                </Overlay>
            </div>
        );
    },
});

export default observer(class ChannelFilter extends Component {
    constructor(props){
  	    super(props);
        extendObservable(this, {
            startDate:moment(),
            expectRank: 3,
            times:[],
            selectTime: moment({ hour:10, minute:0 }),
            minDate: moment(),
            today: moment(),
            checkboxVal:'0,1,2,3,4',
            weekTime: this.props.week || 7,
            checkList: this.props.checkList,
            taskType: this.props.taskType || 0,
            isEdit: true
        });
        this.hiddeTime = this.props.hideTime || false;
        this.initTime();
        if (this.props.initDate) {
            let date = this.props.initDate.split(" ")[0],
                time = this.props.initDate.split(" ")[1].split(':');
            this.startDate = moment(date);
            this.selectTime = moment({hour:time[0],minute:time[1],second:time[2]});
        }
        // 获取真实时间
        utils.getRealTime().then((time)=>{
            this.today = time;
            this.minDate = this.today;
            if (this.props.initDate) {
                let hh = parseInt(this.today.format('HH'));
                if (hh >= 21) {
                    this.minDate = moment(this.today).add(1,'day');
                }   
            }
            else {
                this.startDate = this.today;
                this.selectTime = moment({hour:10, minute:0});
                this.initTime();
            }
            this._onChange();
        });	
        if (this.props.initRank) {
          this.expectRank = this.props.initRank;
        }
  	    this._onChange();
    }
    componentWillReceiveProps(nextProps){
        this.weekTime = nextProps.week;
        this.checkList = nextProps.checkList;
        this.taskType = nextProps.taskType || 0;
        this.isEdit =  !nextProps.isEdit ? nextProps.isEdit : true;
    } 
    initTime() {
        let hh = parseInt(this.today.format('HH'));
        let mm = parseInt(this.today.format('mm'));

        if (hh >= 21) {
            this.minDate = moment(this.today).add(1,'day');
            this.startDate = moment(this.today).add(1,'day');
        }
        else if (hh < 9) {
            this.selectTime = moment({hour:10,minute:0});
        }
        else if(hh == 20) {
            this.selectTime = moment({hour:hh, minute: mm+1});
        }
        else {
            this.selectTime = moment({hour:hh+1, minute:0})
        }
    }


    render() {
        if (this.props.layout && this.props.layout === "h") {
            return this.renderH();
        }
        else if (this.props.layout && this.props.layout === "week") {
            return this.renderW();
        }
        else {
            return this.renderV();
        }
    }

    renderH(){
        this.checkLabelList = checkLabel.map((val, index) => {
            return (
                <div className="col-2 col-filter" key={`key-${index}`} disabled={(this.expectRank == 5 || this.expectRank ==  10) && (index == 4)} onClick={this._checkbox.bind(this, index)}>
                    <span className={"isGoing check-icon " + (this.checkList[index] ? "active" : "")}></span>
                    {val}
                    <CPopover style={{left: 10}} taskId={index}></CPopover>
                </div>
            );
        })
        return (
            <div className="channel-filter">
                <div className="aso-row clearfix">
                    {!this.hiddeTime && (
                        <div className="col-4">
                            <Form horizontal className="aso-formhorizontal">
                                <FormGroup className="aso-formgroup">
                                    <Col componentClass={ControlLabel} md={3} sm={3} lg={3} xs={3}>开始日期：</Col>
                                    <Col md={6} sm={6} lg={6} xs={6} className="aso-padding-r cursor-pointer    ">
                                        <DatePicker minDate={this.minDate}
                                                    dateFormat="YYYY-MM-DD"
                                                    selected = {this.startDate}
                                                    onChange = {(date) => { 
                                                        this.startDate = date;
                                                        this._onChange();
                                                    }}
                                                    customInput={<AsoTimeInput />}
                                        />
                                    </Col>
                                    <Col md={3} sm={3} lg={3} xs={3} className="select-caret-col"> 
                                        {this.renderTimePicker()}
                                    </Col>
                                </FormGroup>
                            </Form>
                        </div>
                    )}
                    <div className="col-3">
                        <Form horizontal className="aso-formhorizontal">
                            <FormGroup className="aso-formgroup">
                                {this.hiddeTime && (
                                    <Col componentClass={ControlLabel} md={5} sm={5} lg={5} xs={5} style={{paddingLeft: 10, textAlign: 'left'}}>目标排名：</Col>
                                )}
                                {!this.hiddeTime && (
                                    <Col componentClass={ControlLabel} md={5} sm={5} lg={5} xs={5}>目标排名：</Col>
                                )}
                                <Col md={7} sm={7} lg={7} xs={7}>
                                    <FormSelect type="top" data={rankSelect} value={this.expectRank} onChange={(evt) => {
                                        this.expectRank = evt.select;
                                        this._onChange();
                                    }}></FormSelect>
                                </Col>
                            </FormGroup>
                        </Form>
                    </div>
                </div>
                <div className="aso-row clearfix aso-row-small" style={{margin:10}}> 
                    {this.checkLabelList}
                    <div className="col-4 text-right" style={{color: '#999'}}> 
                        <span style={{margin: '0 10px'}}>备注：激活任务及注册任务需对接接口</span>       
                        {/* <span>(购买遇到问题？申请发票？)</span>
                        <span style={{margin: '0 10px'}}>|</span>
                        <img src={require('../images/consultation.png')} style={{height: 16, marginRight: 5}} />
                        <a href="http://wpa.qq.com/msgrd?v=3&uin=3277439952&site=qq&menu=yes"  target="_blank" style={{color: '#9f6cf5', marginRight: 10}}>
                            购买咨询
                        </a> */}
                    </div>
                </div>
            </div>
        )
    }
    renderW() {
        return (
            <div className="channel-filter">
                <div className="aso-row clearfix">
                    <div className="col-2">
                        <FormGroup className="aso-formgroup">
                            <ControlLabel>{this.props.timeText ? this.props.timeText : '开始日期'}：</ControlLabel>
                            {this.isEdit ? (
                                <div className="cursor-pointer">
                                    <DatePicker
                                        minDate={this.minDate}
                                        dateFormat="YYYY-MM-DD"
                                        selected={this.startDate}
                                        onChange={(date)=>{
                                            this.startDate = date;
                                            this._onChange();
                                        }}
                                        customInput={<AsoTimeInput />}
                                    />
                                </div>
                            ) : (
                                <div className="form-control selecttype">{this.startDate.format('YYYY-MM-DD')}</div>  
                            )}
                        </FormGroup>
                    </div>
                    <div className="col-3 aso-padding-l">
                        <FormGroup className="aso-formgroup aso-formgroup-week">
                            <ControlLabel className="dl">&nbsp;</ControlLabel>
                            <div disabled={!this.isEdit} className={"col-3 form-control selecttype selecttype1 " + (this.weekTime == 7 && "active")} onClick={this.weekOnChange.bind(this, 7)}>7天</div>
                            <div disabled={!this.isEdit} className={"col-3 form-control selecttype selecttype1 " + (this.weekTime == 14 && "active")} onClick={this.weekOnChange.bind(this, 14)}>14天</div>
                            <div disabled={!this.isEdit} className={"col-3 form-control selecttype selecttype1 " + (this.weekTime == 21 && "active")} onClick={this.weekOnChange.bind(this, 21)}>21天</div>
                        </FormGroup>
                    </div>
                    <div className="col-2 aso-padding-l">
                        <FormGroup className="aso-formgroup">
                            <ControlLabel>目标排名:</ControlLabel>
                            {this.isEdit ? (
                                <FormSelect type="top" task={this.taskType} data={rankSelect} value={this.expectRank} onChange={(evt) => {
                                    this.expectRank = evt.select;
                                    this._onChange();
                                }}></FormSelect>
                            ) : (
                                <div className="form-control selecttype">TOP{this.expectRank}</div>  
                            )}  
                        </FormGroup>
                    </div>
                    <div className="col-3 aso-padding-l" style={{width: 185}}>
                        <FormGroup className="aso-formgroup">
                            <ControlLabel>渠道:</ControlLabel>
                            <div className="form-control selecttype">{this.props.order.channelName}</div>
                        </FormGroup>
                    </div>
                    <div className="col-2 aso-padding-l">
                        <FormGroup className="aso-formgroup">
                            <ControlLabel>类型:</ControlLabel>
                            <div className="form-control selecttype">{this.props.order.taskTypeName}</div>
                        </FormGroup>
                    </div>
                </div>
            </div>
        );
    }
    renderV() {
        return (
            <div className="channel-filter">
                <div className="aso-row clearfix">
                    <div className="col-3" style={{width: 185}}>
                        <FormGroup className="aso-formgroup">
                            <ControlLabel>{this.props.timeText ? this.props.timeText : '开始日期'}：</ControlLabel>
                            {this.isEdit ? (
                                <div className="cursor-pointer">
                                    <DatePicker minDate={this.minDate}
                                            dateFormat="YYYY-MM-DD"
                                            selected={this.startDate}
                                            onChange={(date)=>{ 
                                                this.startDate = date;
                                                this._onChange();
                                            }}
                                            customInput={<AsoTimeInput />}
                                    />
                                </div>
                            ) : (
                                <div className="form-control selecttype">{this.startDate.format('YYYY-MM-DD')}</div>  
                            )}
                        </FormGroup>
                    </div>
                    <div className="col-2 aso-padding-l">
                        <FormGroup className={"aso-formgroup " + (this.isEdit && ("select-caret"))}>
                            <ControlLabel>&nbsp;</ControlLabel>
                            {this.isEdit ? (
                                this.renderTimePicker()
                            ) : (
                                <div className="form-control selecttype">{this.selectTime.format('HH:mm')}</div>  
                            )}
                        </FormGroup>
                    </div>
                    <div className="col-2 aso-padding-l">
                        <FormGroup className="aso-formgroup">
                            <ControlLabel>目标排名:</ControlLabel>
                            {this.isEdit ? (
                                <FormSelect type="top" data={rankSelect} value={this.expectRank} onChange={(evt) => {
                                    this.expectRank = evt.select;
                                    this._onChange();
                                }}></FormSelect>
                            ) : (
                                <div className="form-control selecttype">TOP{this.expectRank}</div>  
                            )}    
                        </FormGroup>
                    </div>
                    <div className="col-3 aso-padding-l">
                        <FormGroup className="aso-formgroup">
                            <ControlLabel>渠道:</ControlLabel>
                            <div className="form-control selecttype">{this.props.order.channelName}</div>  
                        </FormGroup>
                    </div>
                    <div className="col-2 aso-padding-l">
                        <FormGroup className="aso-formgroup">
                            <ControlLabel>类型:</ControlLabel>
                            <div className="form-control selecttype">{this.props.order.taskTypeName}</div>  
                        </FormGroup>
                    </div>
                </div>
            </div>
        );
    }

  
    renderTimePicker(){
        return (
            <div className="cursor-pointer">
                <TimePicker 
                    className="aso-timepicker"
                    value={this.selectTime} 
                    showSecond={false}
                    use12Hours={false}
                    allowEmpty={false}
                    transitionName="fade"
                    onChange={this.timeOnChange.bind(this)}
                    disabledHours={this.disabledHours.bind(this)}
                    disabledMinutes={this.disabledMinutes.bind(this)}
                  />
            </div>
        );
    }

    timeOnChange(time){
        this.selectTime = time;
        this._onChange();
        this.checkSelectTime();
    }

    weekOnChange(week){
        if (!this.isEdit) {
            return;
        }
        this.weekTime = week;
        this._onChange();
    }

    checkSelectTime(){
        // 今天 选择的时间 = 当前时间  选择的分钟 < 当前分钟  => 重置分钟
        let hh = parseInt(this.today.format('HH'));
        let mm = parseInt(this.today.format('mm'));
        let shh = parseInt(this.selectTime.format('HH'));
        let smm = parseInt(this.selectTime.format('mm'));

        if (this.getTimestamp(this.startDate) <= this.getTimestamp(this.today)) {
            if (hh === shh && smm < mm) {
                this.selectTime = moment({hour:hh, minute: mm});
                this._onChange();
            }
        }

        if (shh === 21) {
            this.selectTime = moment({hour:21, minute: 0});
            this._onChange();
        }
    }

    disabledHours() {

        let disabled = [0,1,2,3,4,5,6,7,8,9,22,23];

        if (this.getTimestamp(this.startDate) > this.getTimestamp(this.today)) {
            return disabled;
        }
        else {
            let hh = parseInt(this.today.format('HH'));
            for (let i = 0; i < hh; i++) {
                disabled.push(i); // rc-timer-picker会进行去重
            }
            return disabled;
        }
    }
    disabledMinutes() {  
        let hh = parseInt(this.today.format('HH'));
        let mm = parseInt(this.today.format('mm'));
        let shh = parseInt(this.selectTime.format('HH'));
        let smm = parseInt(this.selectTime.format('mm'));
        let disabled = [];
        //当天 选择了当前的小时
        if (shh == hh && this.getTimestamp(this.startDate) == this.getTimestamp(this.today)) {
            for(let j=0; j<= mm; j++) {
                disabled.push(j);
            }
        }
        if (shh === 21) {
            for(let i = 1; i<=59; i ++){
                disabled.push(i);
            }
        }
        return disabled;
    }

    getTimestamp(date){
        return +moment(moment(date).format('YYYY-MM-DD'));
    }

    _checkbox(val){  
        if (this.props.onSelect) {
            if ((this.expectRank == 5 || this.expectRank == 10) && (val == 4)) {
                return;
            }
            this.props.onSelect({
                checkboxVal: val
            });
        }
    }
    _onChange(){
        if (this.props.onChange) {
            this.props.onChange({
                date: this.startDate.format('YYYY-MM-DD') + " " + this.selectTime.format("HH:mm:ss"),
                rank: this.expectRank,
                week: this.weekTime
            });
        }
    }
});