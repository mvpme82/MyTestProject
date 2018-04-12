import React, { Component } from 'react';
export default class Loading extends Component {
    constructor(props){
  	    super(props);
  	    this.state = {
  		      show: this.props.show
  	    }
        if (this.props.disableOffset) {
            this.offsetStyle = {
                marginTop: 0
            }
        }
        else {
            this.offsetStyle = {
                marginTop: 80
            }
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
            <div className="text-center loading-view" style={this.offsetStyle}>
      	        <img src="http://cdn.coolguang.com/public/66aso/images/loading2.gif" height="34"/>
            </div>
        );
    }
}
