import React from "react"
import * as OrderBookActions from "../actions/OrderBookActions"
import OrderBookStore from '../stores/OrderBookStore'
import TradeHistoryTable from "./OrderBook/TradeHistoryTable"
import Pagination from './CustomComponents/Pagination'
import {Box, BoxSection} from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"

// TODO - use a TradeStore, not OrderBookStore
export default class TradeHistory extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            trades: [],
            tradesPage: 0,
            numTradesPages: 0,
        }
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveTrades)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveTrades)
    }

    changeTradesPage = (page) => {
        OrderBookActions.changeTradesPage(page)
    }

    saveTrades = () => {
        this.setState((prevState, props) => ({
            trades: OrderBookStore.getTradesOnCurrentPage(),
            tradesPage: OrderBookStore.getTradesPage(),
            numTradesPages: OrderBookStore.getNumTradesPages(),
        }))
    }

    render() {
        const {token, pageSize = 10} = this.props
        const {trades, tradesPage, numTradesPages} = this.state

        let content = <EmptyTableMessage>There is no trade history for {token.name}</EmptyTableMessage>
        if (trades && trades.length > 0) {
            content = <TradeHistoryTable base="ETH" token={token.name} trades={trades} pageSize={pageSize}/>
        }

        return (
            <Box title="Trade History">
                {content}
            </Box>
        )
    }
}