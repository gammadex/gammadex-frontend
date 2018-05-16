import React from "react"
import classnames from 'classnames'
import { TabContent, Nav, NavItem, NavLink, TabPane } from 'reactstrap'
import {Box} from "./CustomComponents/Box"
import TradesViewer from "./TradesViewer"
import OrderBookStore from "../stores/OrderBookStore"
import MyTradesStore from "../stores/MyTradesStore"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import AccountStore from "../stores/AccountStore"

export default class TradeHistory extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            activeTab: "marketTrades",
            accountRetrieved: AccountStore.isAccountRetrieved(),
            marketTrades: OrderBookStore.getTrades(),
            myTrades: MyTradesStore.getAllTrades(this.props.token.address)
        }

        this.accountStoreUpdated = this.accountStoreUpdated.bind(this)
        this.marketTradesChanged = this.marketTradesChanged.bind(this)
        this.myTradesChanged = this.myTradesChanged.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.marketTradesChanged)
        MyTradesStore.on("change", this.myTradesChanged)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.marketTradesChanged)
        MyTradesStore.removeListener("change", this.myTradesChanged)
    }

    marketTradesChanged() {
        this.setState({marketTrades: OrderBookStore.getTrades()})
    }

    myTradesChanged() {
        this.setState({myTrades: MyTradesStore.getAllTrades(this.props.token.address)})
    }

    accountStoreUpdated() {
        this.setState({
            accountRetrieved: AccountStore.isAccountRetrieved()
        })
    }

    toggleTab = tab => {
        if (this.state.activeTab !== tab) {
            this.setState({activeTab: tab})
        }
    }

    render() {
        const {accountRetrieved, marketTrades, myTrades} = this.state

        let myTradesComp = <EmptyTableMessage>Please log in to see your trade history</EmptyTableMessage>
        if (accountRetrieved) {
            myTradesComp = <TradesViewer id={1} token={this.props.token} tradesSource={myTrades}/>
        }

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
                        <TradesViewer id={0} token={this.props.token} tradesSource={marketTrades}/>
                    </TabPane>
                    <TabPane tabId="myTrades">
                        {myTradesComp}
                    </TabPane>
                </TabContent>
            </Box>
        )
    }
}