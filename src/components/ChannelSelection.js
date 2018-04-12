import React, { Component } from 'react';
import ChannelItem from './ChannelItem';
import ChannelFilter from './ChannelFilter';
import NoData from './NoData';
import Loading from '../components/Loading';
import Service from '../service';
import {observer} from "mobx-react";
import {extendObservable} from "mobx";
import utils from '../utils';
import _ from 'underscore';



export default observer(class ChannelSelection extends Component { 
    constructor(props){
  	    super(props);
  	    extendObservable(this,{
            channels:[],
            totalChannels:[],
            filterData:null,
            keywords: this.props.keywords,
            active: this.props.active,
            currentRank: null,
            coverdegree: {
                competition: 0, 
                coverDegree: 0 
            },
            rankError: this.props.rankError || [],
            rankLoading: this.props.rankLoad || false,
            initLoading: this.props.loading || false,
            // 存储机刷的状态
            checkboxValOlD: true,
            checkboxVal:{
                0: true,
                1: true,
                2: true,
                3: true,
                4: true
            }
  	    });
        this.throttleChannelInfo = _.throttle(() => {
            this.loadChannelInfo(this.props.appId, this.keywords, this.filterData.rank);	
        }, 1000);
        // 是否需要展示竞争程度和覆盖率
        if (this.props.showExtra) {
            this.throttleCoverDegree = _.throttle(()=>{
                this.loadCoverDegress();
            },1000);
        }
    }

    componentWillReceiveProps(nextProps){
        this.keywords = nextProps.keywords;
        this.active = nextProps.active;
        this.rankError = nextProps.rankError || [];
        this.rankLoading = nextProps.rankLoad || false;
        this.throttleChannelInfo();
        this.throttleCoverDegree && this.throttleCoverDegree();
    } 
    render() {
        this.commList = this.channels.map((val, index) => {
            return (
                <ChannelItem loading={this.rankLoading} rank={this.rankError} keywords={this.keywords} key={`key-${index}`} entity={val} active={this.active} onClick={() => {     
                    this.props.onSelect && this.props.onSelect({
                        optimizeDatetime: this.filterData.date,
                        channelId: val.channelId,
                        expectRank: this.filterData.rank,
                        appId: this.props.appId,
                        keywords: this.keywords,
                        schemeId: this.props.schemeId,
                        taskType: val.taskType
                    });
                }}/>
            );
        })
        return (
            <div style={{position: 'relative'}}>
                <ChannelFilter checkList={this.checkboxVal} initRank={this.props.initRank} layout="h" hideTime={this.props.hideTime} onSelect={(data) => {
                    this.checkboxVal[data.checkboxVal] = !this.checkboxVal[data.checkboxVal];
                    if (data.checkboxVal == 4) {
                        this.checkboxValOlD = this.checkboxVal[4];
                    }
                    this.chooseChannel();     
                }} onChange={(data)=>{
                    this.filterData = data;
                    // 如果top5 , 10 的时候，隐藏保排名任务
                    if (data.rank == 5 || data.rank == 10) {
                        this.checkboxVal[4] = false;
                    }
                    else {
                        this.checkboxVal[4] = this.checkboxValOlD;
                    }
                    if (this.currentRank === null || this.currentRank !== data.rank) {
                        this.loadChannelInfo(this.props.appId, this.keywords, this.filterData.rank);  
                        this.currentRank = data.rank;
                    }
                }}/>
                {this.props.showExtra && (
                    <div className="clearfix cover-compare" style={{left: this.props.showExtraLeft}}>
                        <div className="pull-left">
                            <label>竞争程度:</label>
                            <ul className="list-unstyled pull-right">
                                <li className={"pull-left " + (this.coverdegree.competition === 0 ? "active" : "")}>弱</li>
                                <li className={"pull-left " + (this.coverdegree.competition === 1 ? "active" : "")}>一般</li>
                                <li className={"pull-left " + (this.coverdegree.competition === 2 ? "active" : "")}>强</li>
                            </ul>
                        </div>
                        <div className="pull-left">
                            <label>覆盖率:</label>
                            <span>{this.coverdegree.coverDegree}%</span>
                        </div>
                    </div>
                )}
                <div>
                    {!this.initLoading && this.commList}
                    <Loading show={this.initLoading}/>
                    <NoData show={!this.initLoading && this.commList.length==0}/>
                </div>
            </div>	
        );
    }
    chooseChannel() {
        var newArray=[];
        for(var i in this.checkboxVal){
            if(this.checkboxVal[i]){
              newArray.push(i);
            }
        }   
        var newChannel=[];
        for(var j=0; j<newArray.length; j++){
            for(var k=0; k<this.totalChannels.length; k++) {
                if(newArray[j]==this.totalChannels[k].taskType) {
                    newChannel.push(this.totalChannels[k]);
                }
            }
        }
        this.channels = newChannel;
    }
    loadChannelInfo(appId, keywords, expectRank){
        keywords = utils.joinValid(keywords);
        Service.getChannelSuggestPrice({
            keywords: keywords,
            appId: appId,
            expectRank: expectRank
        }).then((res) => {
            if (res.data.status === 200 && res.data.data) {
                this.channels = res.data.data;
                this.totalChannels = res.data.data;
                if(this.channels.length==0) {
                    this.commList='所有渠道暂时关闭,如需购买请联系我们！';
                }
                this.chooseChannel();
            }
            else {
                this.channels = [];
            }
            this.initLoading = false;
        });
    }

    loadCoverDegress(){
        Service.getCoverDegress(this.props.appId, this.keywords).then((res)=>{
            if (res.data.status === 200 && res.data.data) {
                this.coverdegree = res.data.data;
            }
        })
    }
});
