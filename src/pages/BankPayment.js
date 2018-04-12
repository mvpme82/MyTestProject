import React, { Component } from 'react';
import {observer} from "mobx-react";
import mobx,{extendObservable, computed} from "mobx";
import { Modal , Button} from 'react-bootstrap';
import Service from '../service';
export default observer(class Recharge extends Component {
	constructor(props){
		super(props);	
	}
	componentDidMount(){
		let bankImg = document.getElementById('bankImg');
		bankImg.onload =function() {
            setTimeout(() => {
				var source = Service.getParam('url');
				if (source) {
					window.location.href = source;
				}
			}, 500);
        }
	}
	render() {
		return (
			<div className="aso-payment">
               <img  id="bankImg" src="http://cdn.coolguang.com/public/66aso/images/loading.gif" alt="" style={{margin:'120px auto',display:'block',height: 230}}/>
			</div>
		);
	}
})
