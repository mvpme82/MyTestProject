import React, { Component } from 'react';
import {Pagination , Button} from 'react-bootstrap';
export default class MyPagination extends Component {
	constructor(props){
		super(props);
		this.state = {
			items: this.props.items,
			activePage: this.props.activePage
		}
	}	
	componentWillReceiveProps(nextProps){
		this.setState({
			items: this.props.items,
			activePage: this.props.activePage
		});
	}

	render() {
		if (!this.state.items || this.state.items.length === 0) {
			return <div></div>;
		}
		return (
			<div className="text-right my-pagination">
				<Button 
					className="my-pagination__prev" 
					disabled={(this.state.activePage === 1)} 
					onClick={()=>{this.props.prev && this.props.prev()}}
				>
					<span className="caret"></span>
				</Button>
				<Pagination
					ellipsis
					boundaryLinks
					items = {this.state.items}
					maxButtons = {4}
					activePage = {this.state.activePage}
					onSelect = {this.props.onSelect}
				/> 
				<Button 
					className="my-pagination__next" 
					disabled={this.state.activePage === this.state.items} 
					onClick={()=>{this.props.next && this.props.next()}}
				>
					<span className="caret"></span>
				</Button>
			</div>
		);
	}
}
