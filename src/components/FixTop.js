import React, { Component } from 'react';
import {extendObservable} from "mobx";
export default class FixTop extends Component {
    constructor(props){
        super(props);
        this.state = {
            open: false
        };
        extendObservable(this,{
            showFix: this.props.showFix
        });   
    }
    componentWillReceiveProps(nextProps) {
        this.showFix = nextProps.showFix;
    }
    render() {
        return (
            <div className={"aso-sidebar-panel" + (this.state.open ? " aso-sidebar-panel-expand" : "")}>
                <div className="aso-sidebar-tab">
                    <div className="aso-tab-item aso-tab-zixun">
                        <a href="javascript:void(0)">
                            <span className="s-icon zixun-icon"></span>
                            <p className="tab-txt top-txt">咨询</p>
                        </a>
                        <div className="zixun-wrap">
                            <span className="s-icon zixun-icon-bg"></span>
                            <p className="txt-1">请联系客服：</p>
                            <p className="txt-2">400-0054-520</p>
                        </div>
                    </div>
                    <div className="aso-tab-item aso-tab-zixun">
                        <a href="javascript:void(0)">
                            <span className="s-icon piao-icon"></span>
                            <p className="tab-txt top-txt">发票</p>
                        </a>
                        <div className="zixun-wrap">
                            <span className="s-icon zixun-icon-bg"></span>
                            <p className="txt-1">请联系客服：</p>
                            <p className="txt-2">400-0054-520</p>
                        </div>
                    </div>
                    <div className="aso-tab-item aso-tab-qrCode">
                        <a href="javascript:void(0)">
                            <span className="s-icon weixin-icon"></span>
                            <p className="tab-txt top-txt">微信</p>
                        </a>
                        <div className="qrCode-wrap">
                            <img src="http://cdn.coolguang.com/public/66aso/images/qrCode.jpg"  alt="66aso小助手"/>
                            <p className="txt-1">66aso小助手</p>
                        </div>
                    </div>
                    <div className="aso-tab-item aso-tab-top aso-tab-top-show" onClick={()=>{ 
                        window.scrollTo(0, 0);
                    }}>
                        <a href="javascript:void(0)">
                            <span className="s-icon top-icon"></span>
                            <p className="tab-txt top-txt">TOP</p>
                        </a>
                    </div>

                    <div className="aso-tab-item aso-tab-close" onClick={()=>{ 
                        this.setState({
                            open: false
                        })
                    }}>
                        <a href="javascript:void(0)" title="收起">
                            <span className="f-icon f-close"></span>
                        </a>
                    </div>

                    <div className="aso-tab-item aso-tab-extend" onClick={()=>{ 
                        this.setState({
                            open: true
                        })
                    }}>
                        <a href="javascript:void(0)" title="展开">
                            <span className="f-icon f-extend"></span>
                        </a>
                    </div>

                    <div className="aso-tab-item aso-tab-extend-top" onClick={()=>{ 
                        window.scrollTo(0, 0);
                    }}>
                        <a href="javascript:void(0)">
                            <span className="f-icon top-icon"></span>
                        </a>
                    </div>


                </div>
            </div>
        );
    }
}
