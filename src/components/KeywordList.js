import React, { Component } from 'react';

export default class KeywordList extends Component {
	constructor(props){
		super(props);
		this.state = {
			data: this.props.data.sort((val1, val2)=>{
				return val2.rank - val1.rank;
			})
		}
	}

	componentWillReceiveProps(nextProps){
		this.setState({
			data: nextProps.data
		});
	} 
  	render() {		
		var data = this.state.data;
		return (
			<div className="keyword-list">
				<div className="aso-row aso-col-4 keyword-list__heading">
					<div><span className="keyword-index"></span><span>关键词</span></div>
					<div className="text-center">当前排名</div>
					<div className="text-center">热度</div>
					<div className="text-right">结果数</div>
				</div>
				{data.map((val, index) => {
					return (
						<div className="aso-row aso-col-4 keyword-list__item" key={`key-` + index}>
							<div><span className="keyword-index">{index+1}</span><span title={val.keyword} className="keyword-padding-l text-truncate" color="primary">{val.keyword}</span></div>
							<div className="text-center" title={val.rank == '-' ? '搜索结果中无此应用' : val.rank}>{val.rank}</div>
							<div color="primary" className="text-center">{val.hot}</div>
							<div color="primary" className="text-right">{val.searchResult}</div>	
						</div>
					);
				})}
			</div>
		);
  	}
}