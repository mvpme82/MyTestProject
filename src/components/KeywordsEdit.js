import React, { Component , PropTypes} from 'react';
import ContentEditable from 'react-contenteditable';
import utils from '../utils';
import Service from '../service';

export default class KeywordsEdit extends Component {
    constructor(props){
        super(props);
        this.state = {
            html: ''
        }
        if (props.value){
            this.value = props.value;
            this.state.html = this.parseHtml(props.value);
        }
        else{
            this.value = '';
        }
        this.showerror = props.showerror;
        if (props.placeholder) {
          this.emptyhtml = '<span class="emptyText" style="color: #ccc">' + props.placeholder + '</span>';
        }
        else {
          this.emptyhtml = '<span style="color: #ccc"></span>';
        }
        if (!this.state.html.length){
            this.state.html = this.emptyhtml;
        }
        this.state = {
            html: this.state.html
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    componentDidMount() {
        this.content.htmlEl.addEventListener('DOMNodeInserted', this.onNodeInserted);
        this.props.onBlur && this.props.onBlur(null, this.value);
    }

    init(value) {
        this.value = value;
        if (!this.value){
            this.setState({html: this.emptyhtml});    
        }
        else{
            this.setState({html: this.parseHtml(this.value)});
        }
        this.props.onBlur && this.props.onBlur(null, this.value);
    }
    onNodeInserted(event) {
        if (!event.target.className){
            event.target.style = 'color: #000';
        }
    }
    handleChange(evt) {
        this.value = evt.currentTarget.innerText.trim() || '';
        this.props.onChange && this.props.onChange(evt, this.value);
    }
    handleFocus(evt) {
        if (!this.value){
            this.setState({html: ''});
        }
        else{
            this.setState({html: this.parseHtml(this.value, 1)});
        }
        this.props.onFocus && this.props.onFocus(evt, this.value);
    }
    handleBlur(evt) {
        this.value = evt.currentTarget.innerText;
        if (!this.value){
            this.setState({html: this.emptyhtml});    
        }
        else{
            this.setState({html: this.parseHtml(this.value)});
        }
        this.props.onBlur && this.props.onBlur(evt, this.value);
    }
    markError(error) {
        this.value = this.value.split(/[,，、；;\r\n\s]/).map(function(o){
            if (o && error.indexOf(o) > -1){
              return o + '|error';
            }
            else if (o) {
                return o;
            }
        }).join(',');
        this.setState({
            html: this.parseHtml(this.value)
        });
    }
    parseHtml(str, plain) {
        if (!str) {
            return this.emptyhtml;
        }
        var that = this;
        var joinstr = [];
        str.split(/[,，、；;\r\n\s]/g).map(function(o){
            if (o.indexOf('|error') > -1 && !plain) {
                joinstr.push("<span "+(that.showerror ? "class='error'" : "")+" contenteditable=true>" + o.replace(/\|error/g, '') + "</span>");
            }
            else if (o) {
                joinstr.push("<span contenteditable=true>" + o.replace(/\|error/g, '') + "</span>");
            }
        });
        return joinstr.join(',');
    }
    parseValue(evt) {
        return evt.currentTarget.textContent.replace(/\s/g, '').replace(/[\r\n]/g,'');
    }
    cleanError(){
        var res = [];
        this.value.split(/[,，、；;\r\n\s]/).map(function(o){
            if (o && o.indexOf('|error') == -1){
                res.push(o);
            }
        });
        this.value = res.join(',');
        this.setState({
            html: this.parseHtml(this.value)
        });
        this.props.onChange && this.props.onChange(null, this.value);
    }
    render() {
        return <ContentEditable ref={(contentRef) => {this.content = contentRef}}
                                className="textareatype"
                                html={ this.state.html }
                                disabled={ false }     
                                onChange={ this.handleChange }
                                onFocus={ this.handleFocus }
                                onBlur={ this.handleBlur }
              />
    }
}