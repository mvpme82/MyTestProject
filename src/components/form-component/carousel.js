import React, { Component, PropTypes} from 'react';
import { ButtonToolbar, DropdownButton, MenuItem, Modal, Carousel} from 'react-bootstrap';
import mobx,{extendObservable, computed} from "mobx";
import {observer} from "mobx-react";

export default observer(class FormSelect extends Component {
    constructor(props){
        super(props);
        this.state = {
            index: 0,
            mTop: this.showVertical()
        }
        extendObservable(this, {
            show: this.props.show
        });
    }	
    componentWillReceiveProps(nextProps) {
        this.show = nextProps.show;
        this.index = nextProps.index;
    }
    close() {
        this.props.hide && this.props.hide(this.state.index);
    }
    handleSelect(selectedIndex) {
        this.setState({
            index: selectedIndex
        });
    }
    showVertical() {
        return  (document.documentElement.clientHeight - 502) / 2 -30;
    }
    render() {
        return (
            <Modal backdrop="static" dialogClassName="base-modal cookie-modal" show={this.show}  onHide={this.close.bind(this)} style={{paddingTop: this.state.mTop + 'px'}}>
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <div className="cookie-tips">
                        <span className="num"><em className="big">{this.state.index + 1}</em>/3</span>
                        {this.state.index == 0 && (
                            <label>首先，在Safari浏览器菜单栏中找到safari，选择偏好设置</label> 
                        )}
                        {this.state.index == 1 && (
                            <label>然后，选择隐私设置</label> 
                        )}
                        {this.state.index == 2 && (
                            <label>最后，选择仅允许来自当前的网站</label> 
                        )}  
                    </div>
                    <Carousel activeIndex={this.state.index} onSelect={this.handleSelect.bind(this)} interval={null} nextIcon={<i className="icon-right"></i>} prevIcon={<i className="icon-left"></i>}>
                        <Carousel.Item>
                            <img src="http://cdn.coolguang.com/public/66aso/images/cookie1.jpg" style={{width: 670, height: 338}} />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img src="http://cdn.coolguang.com/public/66aso/images/cookie2.jpg" style={{width: 670, height: 338}} />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img src="http://cdn.coolguang.com/public/66aso/images/cookie3.jpg" style={{width: 670, height: 338}} />
                        </Carousel.Item>
                    </Carousel>
                </Modal.Body>
            </Modal>
        );
    }
})