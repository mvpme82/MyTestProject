import React, { Component } from 'react';
import SegmentedControl from '../components/SegmentedControl';
import {observer} from "mobx-react";
import mobx,{extendObservable} from "mobx";
import KeywordList from '../components/KeywordList';
import AppSelection from '../components/AppSelection';
import Service from '../service';

var ReactToastr = require("react-toastr");
var {ToastContainer} = ReactToastr; // This is a React Element.
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);


export default observer(class SchemeDetail extends Component {

  constructor(props){
  	super(props);
  	extendObservable(this, {
  		appdetail: null,
  		open: false,
  		keywordslist: [],
  		schemedetail: null
  	});


  	if (this.props.location.appdetail) {
  		this.appdetail = this.props.location.appdetail;
  		this.loadKeywords(this.appdetail.appId);
  	} else {
  		this.loadKeywords();	
  	}

  
  }

  render() {
    return (
     	<div className="aso-schemedetail">

     

     		<section className="aso-container">

	      		<div className="clearfix aso-commonheading">
	      			{	
	      				this.appdetail ?
		      			(<div className="pull-left">
		      				<img className="aso-normal-icon cursor-pointer" onClick={()=>{
		      					this.open = true;
		      				}} src={this.appdetail.icon}/>
		      				<dl className="pull-right">
		      					<dt className="aso-commonheading__title">{this.appdetail.title}</dt>
		      					<dd className="clearfix">
		      						<dl className="pull-left">
		      							<dt className="aso-commonheading__subtitle">分类</dt>
		      							<dd className="aso-commonheading__text">{this.appdetail.categoryName}</dd>
		      						</dl>
		      						<dl className="pull-left">
		      							<dt className="aso-commonheading__subtitle">APP ID</dt>
		      							<dd className="aso-commonheading__text">{this.appdetail.appId}</dd>
		      						</dl>
							  		<dl className="pull-left">
		      							<dt className="aso-commonheading__subtitle">开发商</dt>
		      							<dd className="aso-commonheading__text">{this.appdetail.developerName}</dd>
		      						</dl>
		      					</dd>
		      				</dl>
		      			</div>) : 
		      			(
		      				<div className="pull-left">
		      					<span onClick={()=>{this.open = true;}} className="schemedetail__appadd-btn"></span>
		      				</div>
		      			)
	      			}
	      			<div className="pull-right">
	      				<a className="aso-btn aso-style--yellow" onClick={()=>{
	      					if (this.appdetail && this.appdetail.appId) {
	      						this.props.history.push({
	      							pathname: `/appdetail/${this.appdetail.appId}/open/order`,
	      							openorder: true,
	      							orderdetail:{
	      								keywords: this.keywordsStr()
	      							}
	      							// schemeId: this.props.match.params.schemeId
	      						});
	      					} else {
							    this.refs.container.warning(
							      "",
							      "未添加应用", {
							      timeOut: 2000,
							      extendedTimeOut: 0,
							      showAnimation: 'animated fadeInDown',
          						  hideAnimation: 'animated fadeOutUp'
							    });
	      					}
	      				}}>执行方案</a>
	      			</div>
	      		</div>

	      		<KeywordList nolimit={true} data={this.keywordslist}/>

	      		<AppSelection onClose={()=>{this.open = false;}} open={this.open} onSelected={this.selectApp.bind(this)}/>

	        	<ToastContainer ref="container"
	                        toastMessageFactory={ToastMessageFactory}
	                        className="toast-top-right" />
     		</section>
     	</div>
    );
  }

  selectApp(detail){  	
  	this.appdetail = detail;
  	this.loadKeywords(detail.appId);
  }

  // loadSchemeDetail(){
  // 	Service.getScheme(this.props.match.params.schemeId).then((res)=>{
  // 		if (res.data.status === 200 && res.data.data) {
  // 			this.schemedetail = res.data.data;
  // 		}
  // 	});
  // }


  loadKeywords(appId){
  	   Service.getSchemeKeywords(this.props.match.params.schemeId, appId).then((res)=>{
        if (res.data.status === 200 && res.data.data) {
          this.keywordslist = res.data.data;
        }
      });
  }

  keywordsStr(){
  	let str = [];
  	if (this.keywordslist) {
  		this.keywordslist.forEach((val)=>{
  			str.push(val.keyword);
  		});
  	}
  	return str.join(",");
  }
});
