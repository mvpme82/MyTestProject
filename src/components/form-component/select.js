import React, { Component, PropTypes} from 'react';
import { ButtonToolbar, DropdownButton, MenuItem, Col} from 'react-bootstrap';
import mobx,{extendObservable, computed} from "mobx";
import {observer} from "mobx-react";

export default observer(class FormSelect extends Component {
    constructor(props){
        super(props);
        extendObservable(this, {
            data: this.props.data,
            value: this.props.value,
            task: this.props.task || -1,
            type: this.props.type || 'normal',
            activeName:  computed(()=>{
                let acValue;
                this.data.forEach((val)=>{
                    if (val.index == this.value) {
                        acValue =  val.value;
                    }
                }); 
				return acValue;
			})
        });
    }	

    componentWillReceiveProps(nextProps) {
        this.data = nextProps.data;
        this.value= nextProps.value;
        this.type= nextProps.type;
        this.task =  nextProps.task || -1;
    }
    render() {
        let item = this.data.map((val, index) => {
            if (this.task == 4 && (val.value == 'TOP5' || val.value == 'TOP10') && this.type == 'top') {
                return '';
            }
            if (val.index == this.value) {
                return (
                    <MenuItem eventKey={val.index} active key={`key-${index}`}>{val.value}</MenuItem>
                )
            }
            return (
                <MenuItem eventKey={val.index} key={`key-${index}`}>{val.value}</MenuItem>
            );
        });
        return (
            <div className="select-caret-form">
                <ButtonToolbar>
                    <DropdownButton id="select-drop" title={this.activeName}  onSelect={(eventKey)=>{
                        this.value = eventKey;
                        if (this.props.onChange) {
                            this.props.onChange({
                                select: eventKey
                            });
                        }
                    }} value={this.value}>
                        {item}
                    </DropdownButton>
                </ButtonToolbar>
            </div>
        );
    }
})