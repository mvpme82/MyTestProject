import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import SegmentedControl from '../../components/SegmentedControl';

export default class DashboardWrapper extends Component {
    constructor(props) {
        super(props);
        this.checkCurrentTab(props.location.pathname, true);
    }
    render() {
        return (
            <div className="aso-dashboard">
                <section className="aso-container">
                    <div className="text-center dash-segmentcontrol">
                        <SegmentedControl 
                            ref={(ref) => {
                                this.scRef = ref;
                            }}
                            items={['我的资产', '我的方案', '我的订单', '我的监控', '担保订单']}
                            default={this.state.currentTab}
                            onSelected={(idx) => {
                                let path = '';
                                if (idx === 0) {
                                    path = '/dashboard/assets';
                                }
                                else if (idx === 1) {
                                    path = '/dashboard/schemes';
                                }
                                else if (idx === 2) {
                                    path = '/dashboard/orders';
                                }
                                else if (idx === 3) {
                                    path = '/dashboard/monitors';
                                }
                                else if (idx === 4) {
                                    path = '/dashboard/assurances';
                                }
                                this.props.history.push(path);
                            }}
                        />
                    </div>
                    {this.props.routes.map((route, i) => (
                        <Route key={i} {...route}/>
                    ))}
                </section>
            </div>
        );
    }
    componentDidMount() {
      this.props.history.listen((props) => {
            this.checkCurrentTab(props.pathname);
        });
    }

    checkCurrentTab(pathname, init) {
        let currentTab = 0;
        if (/\/dashboard\/assets/.test(pathname)) {
            currentTab = 0;
        }
        else if (/\/dashboard\/schemes/.test(pathname)) {
            currentTab = 1;
        }
        else if (/\/dashboard\/orders/.test(pathname)) {
            currentTab = 2;
        }
        else if (/\/dashboard\/monitors/.test(pathname)) {
            currentTab = 3;
        }
        else if (/\/dashboard\/assurances/.test(pathname)) {
            currentTab = 4;
        }
        if (init) {
            this.state = {
                currentTab: currentTab
            }
        }
        else {
            this.scRef && this.scRef.setActive(currentTab);
        }
    }
}