import React from "react"
import classnames from 'classnames'
import { TabContent, Nav, NavItem, NavLink, TabPane } from 'reactstrap'
import {Box} from "./CustomComponents/Box"
import TradesViewer from "./TradesViewer"
import OrderBookStore from "../stores/OrderBookStore"
import MyTradesStore from "../stores/MyTradesStore"

export default class TradeHistory extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            activeTab: "marketTrades"
        }
    }

    toggleTab = tab => {
        if (this.state.activeTab !== tab) {
            this.setState({activeTab: tab})
        }
    }

    render() {
        return (
            <Box title="Trade History">
                <Nav tabs>
                    <NavItem>
                        <NavLink className={classnames({ active: this.state.activeTab === 'marketTrades' })}
                                 onClick={() => { this.toggleTab('marketTrades'); }}>Market Trades</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className={classnames({ active: this.state.activeTab === 'myTrades' })}
                                 onClick={() => { this.toggleTab('myTrades'); }}>My Trades</NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="marketTrades">
                        <TradesViewer id={0} token={this.props.token} tradesSource={() => OrderBookStore.getTrades()} tradesEvent={OrderBookStore}/>
                    </TabPane>
                    <TabPane tabId="myTrades">
                        <TradesViewer id={1} token={this.props.token} tradesSource={() => MyTradesStore.getAllTrades(this.props.token.address)} tradesEvent={MyTradesStore}/>
                    </TabPane>
                </TabContent>
            </Box>
        )
    }
}