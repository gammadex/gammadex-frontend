import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import TradeHistoryTable from "./OrderBook/TradeHistoryTable"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import MyTradesTable from "./MyTrades/MyTradesTable"

// TODO - use a TradeStore, not OrderBookStore
export default class TradesViewer extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const trades = this.props.tradesSource
        const {token, id} = this.props

        if (trades && trades.length > 0) {
            return <TradeHistoryTable base="ETH" token={token.name} trades={trades} id={id}/>
        } else {
            return <EmptyTableMessage>There is no trade history for {token.name}</EmptyTableMessage>
        }
    }
}