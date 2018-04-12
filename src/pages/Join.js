import React, { Component } from 'react';
import auth from '../auth';
export default class Join extends Component {
	constructor(props){
		super(props);
		this.state = {
			currentTab: 0
		}
		auth.checkStatus().then((isLogin)=>{});
	}
	render() {
		return (
			<div className={"aso-join " + (this.state.currentTab === 1 && "aso-join--bg")}>
				<div className={"aso-join__nav"}>
					<nav className="aso-container">
						<ul className="list-unstyled clearfix">
							<li className={"pull-left " + (this.state.currentTab === 0 && "active")} onClick={this.switchTab.bind(this,0)}>招商首页</li>
							<li className={"pull-left " + (this.state.currentTab === 1 && "active")} onClick={this.switchTab.bind(this,1)}>入驻流程</li>
						</ul>
					</nav>
				</div>
				{
					this.state.currentTab === 0 && <div className="aso-join__banner"><a href="http://shangjia.66aso.com/" target="_blank" className="aso-join__btn">我要入驻</a></div>
				}
				<section className="aso-container">
					{
						this.state.currentTab === 0 ? this.renderTab1() : this.renderTab2()
					}
				</section>
			</div>
		);
	}

	renderTab2(){
		return (<div className="flow-container">
			<div className="flow-item">
				<img height="409" alt="" src='http://cdn.coolguang.com/public/66aso/images/flow-1-min.png'/>
			</div>
			<div className="flow-item">
				<img height="169" alt="" src='http://cdn.coolguang.com/public/66aso/images/flow-2-min.png'/>
			</div>
			<div className="flow-item">
				<img height="270" alt="" src='http://cdn.coolguang.com/public/66aso/images/flow-3-min.png'/>
			</div>
			<div className="flow-item">
				<img height="410" alt="" src='http://cdn.coolguang.com/public/66aso/images/flow-4-min.png'/>
			</div>
			<div className="flow-item">
				<img height="409" alt="" src='http://cdn.coolguang.com/public/66aso/images/flow-5-min.png'/>
			</div>
			<div className="flow-item">
				<img height="344" alt="" src='http://cdn.coolguang.com/public/66aso/images/flow-6-min.png'/>
			</div>
		</div>);
	}
	renderTab1(){
		return (<div className="join-index">
			<img className="join-flow" alt="" src='http://cdn.coolguang.com/public/66aso/images/join-flow-min.png'/>
		</div>);
	}
	switchTab(idx){
		this.setState({
			currentTab: idx
		})
	}
}
