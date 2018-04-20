import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import TradeHistoryTable from "./OrderBook/TradeHistoryTable"
import {Box} from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"

// TODO - use a TradeStore, not OrderBookStore
export default class TradeHistory extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            trades: OrderBookStore.getTrades(),
        }

        this.saveTrades = this.saveTrades.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveTrades)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveTrades)
    }

    saveTrades() {
        this.setState((prevState, props) => ({
            trades: OrderBookStore.getTrades(),
        }))
    }

    render() {
        const {token} = this.props
        const {trades} = this.state

        let content = <EmptyTableMessage>There is no trade history for {token.name}</EmptyTableMessage>
        if (trades && trades.length > 0) {
            content = <TradeHistoryTable base="ETH" token={token.name} trades={trades}/>
        }

        return (
            <Box title="Trade History">
                {content}
            </Box>
        )
    }
}