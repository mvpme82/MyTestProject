import React, { Component } from 'react';
import Service from '../service';

var ReactToastr = require("react-toastr");
var {ToastContainer} = ReactToastr; // This is a React Element.
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

export default class KeywordImport extends Component {
    constructor(props){
	    super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    render() {
        return (
            <a className="keyword-import-btn" onClick={this.importFile.bind(this)}>
                批量导入关键词
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right" />
            </a>
        );
    }

    importFile(){
        if (!this.input) {
            let input = document.createElement('input');
            input.type = 'file';
            input.name = 'file';
            input.onchange = this.handleChange.bind(this);
            input.accept = '.xls,.xlsx';
            document.body.appendChild(input);
            this.input = input;
        }
        this.input.click();
    }



    handleChange(event) {
  	    let files = this.input.files;
        if (files && files[0]) {
            let fd = new FormData();
            fd.append('file', files[0]);
            // 需要登录
            Service.importKeyword(fd).then((res)=>{
                if (res.data.status === 200 && res.data.data && this.props.onImported) {
                    this.props.onImported(res.data.data.join(','));
                }
                else if(res.data.msg) {
                    this.showError(res.data.msg);
                }
            });
        }
        this.input.parentNode.removeChild(this.input);
        this.input = null;
    }

    showError(errMsg){
        this.refs.container.warning("", errMsg, {
            timeOut: 2000,
            extendedTimeOut: 0,
            showAnimation: 'animated fadeInDown',
            hideAnimation: 'animated fadeOutUp',
        });
    }
}
