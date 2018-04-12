import React, { Component } from 'react';
import { Accordion, Panel } from 'react-bootstrap';
import { observer } from "mobx-react";
import { extendObservable, observable, autorun } from "mobx";


export default observer(class FilterAccordion extends Component {
    constructor(props) {
        super(props);
        extendObservable(this, {
            expand: true,
            condition: this.props.condition,
            isFirst: true
        });
    }
    componentWillReceiveProps(nextProps) {
        this.condition = nextProps.condition;
        if (this.isFirst) {
            if (this.props.type === 'scheme' ) {
                this.condition.map((item, index) => {
                    if (item.key == 'category_id') {
                        item.items.map((k, i) => {
                            if (k.category_id == this.getParam('categoryId')) {
                                this.itemClicked(i, 0);
                            }
                        })
                    }
                })
            }
            this.isFirst = false;
        }
    }

    render() {

        return (
            <div className = { "aso-accordion " + (this.expand && "active") } >
                <Panel collapsible expanded = { this.expand } > {
                    this.condition.map((val, index) => {
                        return ( 
                            <div className = "aso-filter-item clearfix" key = { index } >
                                <div className = "pull-left" > { val.title } </div>
                                    { this.renderItems(val.items, index) }
                            </div>
                        )
                    })
                } 
                </Panel> 
            </div>
        );
    }


    renderItems(items, pIndex) {

        return ( 
            <ul className = "list-unstyled clearfix pull-right"> {
                items.map((val, index) => {
                        return ( < li onClick = { this.itemClicked.bind(this, index, pIndex) }
                            className = { "pull-left " + (val.active && "active") }
                            key = { `key-${index}` } > { val.name } 
                            </li>);
                        })
                } 
            </ul>
        );
    }

    itemClicked (index, pIndex) {
        var lis = document.querySelector('.aso-filter-item li');
        if (this.condition[pIndex].items[index].active || lis.hasAttribute('disabled')) {
            return
        };
        this.condition[pIndex].items.forEach((val) => {
            val.active = false;
        });

        this.condition[pIndex].items[index].active = true;

        if (this.props.onSelected) {
            let selected = [];
            this.condition.forEach((cond) => {
                cond.items.forEach((item) => {
                    if (item.active == true) {
                        selected.push(item);
                    }
                });
            });
            this.props.onSelected(selected);
        }
    }
    getParam(name) {
        var Locationurl;
        Locationurl = window.location.href;
        // url = decodeURIComponent(url);
        var r = new RegExp('(\\?|#|&)' + name + '=([^&#]*)(&|#|$)');
        var m = Locationurl.match(r);
        return m ? decodeURIComponent(m[2]) : null;
    }
});
