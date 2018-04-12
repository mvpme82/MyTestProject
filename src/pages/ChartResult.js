import React, { Component } from 'react';
import {observer} from "mobx-react";
import {extendObservable,computed,autorun} from "mobx";
import { Accordion, Panel, Button,OverlayTrigger,Tooltip } from 'react-bootstrap';
import objectAssign from 'object-assign';
import _ from 'underscore';
import ReactHighcharts  from 'react-highcharts';
import Service from '../service';
import Loading from '../components/Loading';
let ReactToastr = require("react-toastr");
let {ToastContainer} = ReactToastr;
let ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

let chartY = [];

let config = {
    title: {
        text: '',
        x: -20
    },
    chart: {
        type: 'spline',
        backgroundColor: 'rgba(248, 251, 254, 1)',
        height: 300
    },
    credits:{
        enabled: false
    },
    plotOptions: {
        series: {
            marker: {
                symbol: 'circle'
            }
        }
    },
    tooltip: {
        shared: true,
        crosshairs: true,
        useHTML: true,
        headerFormat: '<small>{point.key}</small><table>',
        pointFormatter:  function (){ 
            // 提示框格式化字符串
            let s = '<tr>';
            s += '<td style="color: '+ this.color +'" title="' + this.series.name +'">';
            s += '<em style="display: inline-block;background-color: '+ this.color +';width: 4px;height:4px;border-radius: 2px;vertical-align: middle;margin-right: 3px;"></em>' + (this.series.name.length > 20 ? this.series.name.substring(0, 20) + '...' : this.series.name) + '</td>';
            s += '<td style="text-align: right"><b>: ' + ['弱', '一般', '强'][this.y] + '</b></td></tr>';
            return s;
        },
        footerFormat: '</table>',
        valueDecimals: 2,
        backgroundColor: '#fff',
        shadow: false,
        style: {
            boxShadow: '0 4px 8px 0 rgba(159, 108, 245, 0.14)',
            fontSize: "10px"
        },
        plotOptions: {
            spline: {
                marker: {
                    lineColor: '#666666',
                    lineWidth: 1
                }
            }
        }
    },
    yAxis: {
        title:{
            text: ''
        }, 
        max: 2,
        min: -1,
        minTickInterval:1,
        tickPixelInterval:58,
        gridLineDashStyle: 'longdash',
        labels: {
            formatter: function () {
                return ['弱', '一般', '强'][this.value];
            }
        }
    },
    xAxis: {
        categories: [],
        labels: {
            style: {
                fontSize: 11
            },
            formatter: function () {
                let xs = this.value.split('-');
                return xs[1] + '-' + xs[2];                
            }
        }      
    },
    legend: {
        enabled: false
    },
    series: [{
        name: "1",
        data: [0,0,0,0,0,0,0],
        type: 'spline'
    }, {
        name: "2",
        data: [0,0,0,1,0,0,0],
        type: 'spline'
    }]
};
export default observer(class ChartResult extends Component {
    constructor(props){
        super(props);
        this.state = {
            xSeries: [],
            ySeries: []
        }
        extendObservable(this, {
            colors: ['#9f6cf5','#2d74f8','#42cd48','#ee7f43','#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1', '#EE00EE', '#EE0000','#9ACD32', '#9400D3', '#838B83', '#FFF68F', '#97FFFF', '#00BFFF', '#A52A2A', '#CDC5BF', '#5D478B', '#8B0000', '#FA8072', '#FFEBCD', '#EEB422', '#8B658B', '#C6E2FF', '#90EE90', '#EED2EE', '#FF6347', '#FFA500', '#CD2626', '#EEDD82', '#2E8B57', '#561212', '#8B8B00', '#CD5C5C', '#C71585'],
            keywords:[],
            rank: 0,
            rankList: [1, 3, 5, 10],
            day: 1,
            dayList: [7, 30],
            initLoading: true
        });
        if (window.location.hash){
            this.getHash();
        }
    }
    render() {
        config.xAxis.categories = this.state.xSeries;
        config.series = this.state.ySeries;
        let tags = this.keywords.map((val, index)=>{
            return (
                <div className="tag"  key={`key-${index}`} style={{color: this.colors[index]}}  disabled = {!(this.state.ySeries[index] && this.state.ySeries[index].visible)}> 
                    <OverlayTrigger  placement="top" overlay={<Tooltip id="t-name">{val}</Tooltip>}>
                        <span  onClick = {this.showChart.bind(this, index)}>{val}</span>
                    </OverlayTrigger>
                    <OverlayTrigger placement="top" overlay={<Tooltip id="t-delete">删除</Tooltip>}>
                        <i className="tag-close" onClick = { this.delTags.bind(this, index)}></i>
                    </OverlayTrigger>
                </div>
            );
        });
        return (
            <div className="aso-chart">
				<div className="aso-chart-main  aso-chart-main-result">
                    <h2 className="aso-chart-title">竞争指数查询</h2>
                    <form className="aso-chart__search"  onSubmit={this.enterSearch.bind(this)}>
                        <input ref="keyword" placeholder="输入关键词，多个关键词用逗号隔开"/>
                        <span onClick={this.enterSearch.bind(this)}>
                            <i className="aso-icon-search"></i>
                            查询
                        </span>
                    </form>
				</div>
                {this.keywords.length > 0 && (
                    <div className="aso-chart-result">
                        <div className="aso-chart-tag">
                            {tags}
                            <form className="aso-add-tag" onSubmit={this.addKeyWord.bind(this)}>
                                <input ref="addword" placeholder="添加关键词"/>
                                <i className="tag-add" title="添加关键词" onClick={this.addKeyWord.bind(this)}>+</i>
                            </form>
                        </div>
                        <div className="aso-filter clearfix">
                            <ul className = "list-tags clearfix pull-left"> {
                                this.rankList.map((val, index) => {
                                        return (
                                            < li onClick = { this.itemClicked.bind(this, val, index) }
                                                 className = { "pull-left " + (index == this.rank  && "active") }
                                                 key = { `key-${index}` } >
                                                 TOP{val} 
                                            </li>);
                                        })
                                } 
                            </ul>
                            <ul className = "list-days clearfix pull-right"> {
                                this.dayList.map((val, pindex) => {
                                        return (
                                            < li onClick = { this.itemClickedDate.bind(this, val, pindex) }
                                                 className = { "pull-left " + (pindex == this.day  && "active") }
                                                 key = { `key-${pindex}` } >
                                                 {val}天
                                            </li>);
                                        })
                                } 
                            </ul>
                        </div>
                        <Loading show={this.initLoading}/>
                        <div className="aso-high-chart" style={{display: this.initLoading ? 'none' : 'block'}}>
                            <ReactHighcharts config = {config}></ReactHighcharts>
                        </div>
                    </div>
                )}
                {this.keywords.length == 0 && (
                    <div className="aso-chart-empty"></div>
                )}
                <ToastContainer ref="container"
	                        toastMessageFactory={ToastMessageFactory}
	                        className="toast-top-right" />
            </div>
        );
    }

    getHash() {
        this.initLoading = false;
        chartY = [];
        // 获取hash数值
        let hash = decodeURIComponent(window.location.hash.substring(1));
        hash = this.toArray(hash);        
        // 去重
        hash = this.removeDuplicatedItem(hash);
        this.keywords = hash;
        this.keywords.map((val, key) => {
            this.getChartByKey(val, key);
        });
    }
    /**
     * 字符串切割成数组，去掉空值 
     * 
     * @param {String} url hash字符串 
     * @returns 
     */
    toArray (str) {
        str = str.toString();
        let  array = str.split(/[,，]/);
        for(let i = 0 ; i < array.length; i++) {
            if(array[i] == "" || typeof(array[i]) == "undefined") {
                array.splice(i, 1);
                i = i-1;
            }              
        }
        return array;
    }
    
    /**
     * 数组去重
     * 
     * @param {Array} ar 数组 
     * @returns 
     */
    removeDuplicatedItem(ar) {
        let tmp = {},
            ret = [];
        for (let i = 0, j = ar.length; i < j; i++) {
            if (!tmp[ar[i]]) {
                tmp[ar[i]] = 1;
                ret.push(ar[i]);
            }
        }
        return ret;
    }

    /**
     * 点击查询触发
     * 
     * @param {Object} evt 
     */
    enterSearch(evt){
        evt.preventDefault();
        let kw = this.refs.keyword.value;
        if (kw) {
            window.location.hash = kw;
            kw = this.toArray(kw);
            this.keywords = kw;
            this.keywords = this.removeDuplicatedItem(this.keywords);
            this.allKey();
            this.refs.keyword.value = '';
        }
        else {
            this.refs.container.error(
                "",
                "关键词不能为空", 
                {
                    timeOut: 2000,
                    extendedTimeOut: 0,
                    showAnimation: 'animated fadeInDown',
                    hideAnimation: 'animated fadeOutUp',
                }
            );      
        }
    }

    showChart(index) {
        let series = this.state.ySeries;
        series[index].visible = !series[index].visible;
        this.setState({
            ySeries: series
        });
    }
    delTags(index) {
        // 删除
        let series = this.state.ySeries;
        this.keywords.splice(index, 1);
        window.location.hash = this.keywords.join(',');
        series.splice(index, 1);
        // 重置colors
        for(let i = 0 ; i < series.length; i++) {
            series[i].color = this.colors[i] || '#9f6cf5'
        }
        this.setState({
            ySeries: series
        });
        // this.allKey();
    }
    itemClicked(val, index) {
        this.rank = index;
        this.allKey();
    }
    itemClickedDate(val, index) {
        this.day = index;
        this.allKey();
    }
    addKeyWord(evt) {
        evt.preventDefault();
        let kw = this.refs.addword.value;
        if (kw && kw !== '') {
            window.location.hash = window.location.hash ? window.location.hash + ',' + kw : kw;
            kw = this.toArray(kw);
            this.keywords = this.keywords.concat(kw);
            this.keywords = this.removeDuplicatedItem(this.keywords);
            for (let i = 0; i < kw.length; i++) {
                this.getChartByKey(kw[i], this.keywords.length + i - kw.length);
            } 
            this.refs.addword.value = '';
        }
        else {
            this.refs.container.error(
                "",
                "关键词不能为空", 
                {
                    timeOut: 2000,
                    extendedTimeOut: 0,
                    showAnimation: 'animated fadeInDown',
                    hideAnimation: 'animated fadeOutUp',
                }
            );      
        }
    }

    
    allKey() {
        this.initLoading = true;
        if (this.keywords.length > 0){
            this.setState({
                xSeries: [],
                ySeries: []
            });
            chartY = [];
            this.keywords.map((val, key) => {
                this.getChartByKey(val, key);
            });
        }
    }

    /**
     * 获取图表数据
     * 
     * @param {String} keys  关键词
     * @param {number} index 索引
     * @returns 
     */
    getChartByKey(keys, index) {
        chartY.push({});
        if (!keys) {
            return;
        }
        Service.keyWordRank({
            keyword: keys,
            rank: this.rankList[this.rank],
            days: this.dayList[this.day]
        }).then((res)=>{
            if (res.data.status == '200') {
                let data = res.data.data.detail;
                let x = [];
                let y = [];
                for (let i in data) {
                    x.push(i);
                    y.push(data[i]);
                }
                chartY[index] = {
                    name: keys,
                    data: y,
                    color: this.colors[index] || '#9f6cf5',
                    visible: true
                };
                this.setState({
                    xSeries: x,
                    ySeries: chartY
                });
                if (index == this.keywords.length - 1) {
                    this.initLoading = false;
                }
            }
        }).catch(()=>{
            this.initLoading = false;
        });
    }
});
