import React, { Component } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Service from '../service';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
const queryString = require('query-string');

export default class Search extends Component {

    constructor(props){
        super(props);
        this.state = {
            results: [],
            hasMore: true,
            error: false,
            isEmpty: false,
            page: 1
        }   
    }

    render() {
        return (
            <div className="aso-search">
                <section className="aso-container">
                    {this.state.isEmpty ? <NoData show={true}/> : this.renderSearchList()}
                </section>
            </div>
        );
    }

    loadData(){
        let page = this.state.page;
        Service.searchScheme(this.props.match.params.keyword, 50, page).then((response)=>{
            if (response.data && response.data.status === 200) {
                this.setState({
                    results:this.state.results.concat(response.data.data),
                    page: page + 1
                });
                if (response.data.data.length < 50) {
                    this.setState({
                        hasMore: false
                    })
                }
                if (page === 1 && response.data.data.length === 0) {
                    this.setState({
                        isEmpty: true
                    });
                }
            }
        }).catch((err)=>{
            this.setState({
                hasMore: false
            })
        })
    }

    componentWillReceiveProps(nextProps){
        this.inSRef && (this.inSRef.pageLoaded = 0);
        this.setState({
            results: [],
            hasMore: true,
            error: false,
            isEmpty: false,
            page: 1
        });
    }

    renderSearchList() {
        var that = this;
        return (
            <InfiniteScroll 
                            pageStart={0}
                            loadMore={this.loadData.bind(this)}
                            hasMore={this.state.hasMore}
                            loader={
                                <div className="aso-loader text-center"><Loading disableOffset show={true}/></div>
                            }
            >
                {this.state.results.map(function(val, index) {
                    return (
                        <div className="search-item clearfix" onClick={that.enterDetail.bind(that, val)}  key={`key-${index}`}>
                            <img height="68" width="68" alt={val.appName} src={val.icon} width="68" className="search-item__appicon"/>
                            <dl className="search-item__appinfo">
                                <dt className="aso-trancate">{index + 1}. {val.appName}</dt>
                                <dd className="aso-trancate">{val.developer}</dd>
                                <dd className="aso-trancate">{val.genres}</dd>
                            </dl>
                            <div className="search-item__appstat pull-right">
                            </div>
                        </div>
                    )
                })}
            </InfiniteScroll>
        );
    }

    enterDetail(val){
        const parsed = queryString.parse(this.props.location.search);
        var openfrom = parsed.openfrom ? Number(parsed.openfrom) : this.props.location.openfrom;
        var path = `/appdetail/${val.appId}`;

        if (openfrom) {
            if (Number(openfrom) === 1){
                path = `/appdetail/${val.appId}/open/order`
            }
            if (Number(openfrom) === 2){
                path = `/appdetail/${val.appId}/open/monitor`
            }
            if (Number(openfrom) === 4){
                path = `/assurance/detail/${val.appId}`
            }
        }
        if (this.props.type === 'assurance') {
            path = `/assurance/detail/${val.appId}`;
            openfrom = 4;
        }
        this.props.history.push({
            pathname: path,
            appdetail: val,
            openfrom: openfrom
        });
    }
}