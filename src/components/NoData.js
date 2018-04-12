import React, { Component } from 'react';

export default class NoData extends Component {
    constructor(props){
  	    super(props);
  	    this.state = {
  		      show: this.props.show
  	    }
    }
    componentWillReceiveProps(nextProps){
        this.setState({
            show: nextProps.show
        })
    }
    render() {
  	    if(!this.state.show) return null;
        return (
            <div className="text-center loading-view">
                <img src={require('../images/no.png')} height="132"/>
            </div>
        );
    }
}
