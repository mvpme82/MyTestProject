import React, { Component } from 'react';
import { Overlay, Button, Popover, OverlayTrigger } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import utils from '../utils';

export default class ChannelItem extends Component {
    constructor(props){
  	    super(props);
        this.state = {
            entity: this.props.entity,
            isActive: false,
            // 金额>0，正常显示金额; 金额=0 && 无关键词，正常显示金额0 ; 金额=0 && 无关键词，正常显示金额0; 金额=0 && 所有关键词都超过200名或无排名，显示“无法优化"
            rank: this.props.rank,
            loading: this.props.loading,
            keywords: this.props.keywords
        }
    }	

    componentWillReceiveProps(nextProps) {
        this.state = {
            entity: nextProps.entity,
            isActive: nextProps.active,
            rank: nextProps.rank,
            loading: nextProps.loading,
            keywords: nextProps.keywords
        }
    }
    render() {
        return (
            <div className="channel-item clearfix">
                <div className="pull-left">  
                    <div>
                        <span className="channel-item__title">
                            {['快速安装任务', '排重安装任务', '激活任务', '注册任务', '保排名任务'][this.state.entity.taskType]}
                        </span>
                        {this.state.entity.taskType < 4 && (
                            <span>
                                {this.priceShow(0)}
                                <span style={{fontSize: 14, color: '#ccc'}}>（单价：{this.state.entity.channelPrice}元，任务量：{this.state.entity.suggestDownload}）</span>
                            </span>
                        )}
                        {this.state.entity.taskType == 4 && this.priceShow(1)}
                    </div>
                    <div>
                        <span style={{fontSize: 12, color: '#ccc'}}>
                            {this.state.entity.channelName}
                        </span>
                        <span className="channel-item__desc">{this.state.entity.channelDesc}</span>
                    </div>
                </div>
                <div className="pull-right">
                    <Button className="aso-style fixed-width-btn"  onClick={()=>{ 
                        if (this.props.onClick) {
                            this.props.onClick(this.state.entity);
                        } 
                    }} bsStyle="primary">
                        立即购买
                    </Button>	
                </div>
            </div>
        );
    }
    priceShow(type) {
        if (this.state.loading) {
            return (
                <span className="channel-item__price"><b>计算中...</b></span>
            );
        }
        // 金额>0，正常显示金额; 金额=0 && 无关键词，正常显示金额0 ; 金额=0 && 无关键词，正常显示金额0; 金额=0 && 所有关键词都超过200名或无排名，显示“无法优化"
        let keyLen = utils.splitValid(this.state.keywords);
        if (this.state.entity.suggestFee !== '0.00' || this.state.entity.machinePrice  > 0) {
            if (type) {
                return (
                    <span>
                        <span className="channel-item__price">￥<b>{(this.state.entity.machinePrice / 7).toFixed(2)}</b></span>
                        <span style={{fontSize: 14, color: '#ccc'}}>X 7天</span>
                    </span>
                )
            }
            return (
                <span className="channel-item__price">￥<b>{this.state.entity.suggestFee}</b></span>
            );
        }

        if (this.state.rank.length == 0 && keyLen.length == 0) {
            if (type) {
                return (
                    <span>
                        <span className="channel-item__price">￥<b>0.00</b></span>
                        <span style={{fontSize: 14, color: '#ccc'}}>X 7天</span>
                    </span>
                )
            }
            return (
                <span className="channel-item__price">￥<b>0.00</b></span>
            )      
        }
        if (this.state.rank.length > 0) {
            return (
                <span className="channel-item__price"><b>已达标</b></span>
            );
        }
        else {
            return (
                <span className="channel-item__price"><b>无法优化</b></span>
            );
        }
    }
}