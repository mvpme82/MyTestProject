import React, { Component } from 'react';
import {observer} from "mobx-react";
import mobx,{extendObservable} from "mobx";

export default observer(class SortSpan extends Component {
	constructor(props){
		super(props);
		extendObservable(this, {
			// 0 默认 2 降序， 1升序
			reverse: this.props.reverse
		});
	}
	componentWillReceiveProps(nextProps){
		this.reverse = nextProps.reverse;
    }
	render() {
		return (
				<span className="sort-span" onClick={this.reverseSort.bind(this)}>
					{this.props.title != '' && (
						<span>{this.props.title}</span>
					)}
					<span className={"carets " + (this.reverse == 1 && " asc ") + (this.reverse == 2 && " desc ")}>
				</span>
		</span>);
	}
	reverseSort() {
		let reverse = this.reverse;
		if (reverse < 2) {
			reverse++;
		}
		else {
			reverse = 0;
		}
		this.setState({
			reverse: reverse
		});
		this.props.onChange && this.props.onChange(reverse);
	}
})
