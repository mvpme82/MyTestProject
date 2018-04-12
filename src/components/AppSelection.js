import React, { Component } from 'react';
import {observer} from "mobx-react";
import mobx,{extendObservable} from "mobx";
import Service from '../service';
import { Button } from 'react-bootstrap';
import Loading from './Loading';

const PAGE_SIZE = 20;
export default observer(class AppSelection extends Component {
	constructor(props){
		super(props);
		extendObservable(this,{
			open: false,
			keyword: '',
			results: [],
			currentPage: 1,
			totalPage: 0,
			disableNextBtn: false,
			loading: false,
			loadingMark: false,
			hideNext:false
		});
	}
	componentWillReceiveProps(nextProps){
		this.open = nextProps.open;
	}
  	render() {
		return (
			<div>
				<div className={"app-selection" + (this.open ? " app-selection--expand" : "")}>
					<div className="appsel-header">
						<div>
							<span className="appsel-close" onClick={()=>{
								this.open = false;
								this.props.onClose && this.props.onClose();
							}}>
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18">
									<path fill="#BBB" fillRule="evenodd" d="M10.414 9l7.071 7.071a.999.999 0 1 1-1.414 1.414L9 10.414l-7.071 7.071a.999.999 0 1 1-1.414-1.414L7.586 9 .515 1.929A.999.999 0 1 1 1.929.515L9 7.586 16.071.515a.999.999 0 1 1 1.414 1.414L10.414 9z"/>
								</svg>
							</span>	      			
						</div>
						{this.renderSearch()}
					</div>
					<div className="appsel-body">
						{!this.loading && this.results.map((val, index)=>{
							return (
								<div key={index} className="search-item clearfix">
									<img height="68" alt="" width="68" src={val.icon} className="search-item__appicon"/>
									<dl className="search-item__appinfo">
										<dt className="aso-trancate" title={val.appName}>{val.appName}</dt>
										<dd className="aso-trancate" title={val.developer}>{val.developer}</dd>
										<dd className="aso-trancate" title={val.genres}>{val.genres}</dd>
									</dl>
									{
										<div className="pull-right">
											<div>
												<Button onClick={()=>{
													this.open = false;
													this.props.onClose && this.props.onClose();
													this.props.onSelected && this.props.onSelected({
															appId:val.appId,
															title:val.appName,
															categoryName:val.genres,
															developerName:val.developer,
															icon: val.icon
													});
												}} bsClass="btn" bsStyle="primary" className="aso-style">
													添加
												</Button>
											</div>
										</div>
									}
								</div>
							);
						})}
						<div className="text-center">
							<Loading show={this.loading}/>
						</div>
							{(this.results.length && !this.hideNext) ? (
								<div className="text-center" style={{width:'100%',marginTop:30,marginBottom:100}}>
									<Button onClick={()=>{
										this.currentPage = this.currentPage - 1;
										this.loadData(this.currentPage);
									}} disabled={this.currentPage === 1} className="aso-style" bsStyle="primary">
										上一页
									</Button>
									<span style={{width:20,display:'inline-block'}}></span>
									<Button onClick={()=>{
										this.currentPage = this.currentPage + 1;
										this.loadData(this.currentPage);
									}} disabled={this.disableNextBtn} className="aso-style" bsStyle="primary">
										下一页
									</Button>
								</div>
							) : null}
					</div>
				</div>
			</div>
		);
  	}

	renderSearch(){
		return (
			<form className="aso-nav__search appsel-nav-search" onSubmit={this.searchApp.bind(this)}>
				<input ref="keyword" placeholder="搜索应用名称"/>
				<span onClick={this.searchApp.bind(this)}>
					<i className="aso-icon-search"></i>
				</span>
			</form>
		);
	}
	searchApp(evt){
		let val = this.refs.keyword.value;
		if (val && this.keyword !== val) {
			this.keyword = val;
			this.currentPage = 1;
			this.loadData(this.currentPage);
		}
		evt.preventDefault();
	}

	loadData(page){
		this.loading = true;
		
		Service.searchScheme(this.keyword,PAGE_SIZE,page).then((response)=>{
			if (response.data && response.data.status === 200) {
				this.results = response.data.data;
				this.disableNextBtn = this.results.length < PAGE_SIZE;
				if (this.results.length < PAGE_SIZE && this.currentPage === 1) {
					this.hideNext = true;
				}
				else {
					this.hideNext = false;
				}
			}
			this.loading = false;
		}).catch(()=>{
			this.loading = false;
		})
	}
});
