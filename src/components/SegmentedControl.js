import React, { Component } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';


export default class Footer extends Component {
	constructor(props){
		super(props);
		this.state = {
			active: this.props.default
		}
	}
	render() {
		return (
			<ButtonGroup className="aso-buttongroup">
				{this.props.items.map((val, index)=>{
					return (
						<Button onClick={()=>{
							this.setState({
								active: index
							});
							if (this.props.onSelected) {
								this.props.onSelected(index);
							}
							}} className={(this.state.active === index && "active")} key={`key-` + index}>
							{/* {index === 0 && (
								<i></i>
							)} */}
							{val}
						</Button>
					)
				})}
			</ButtonGroup>
		);
	}

	setActive(idx){
		this.setState({
			active: idx
		})
	}
}
