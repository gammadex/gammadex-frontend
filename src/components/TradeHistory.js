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
        }
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveTrades)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveTrades)
    }

    saveTrades = () => {
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