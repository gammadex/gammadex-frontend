import React from "react"
import {Box} from "./CustomComponents/Box"
import OrderBookStore from "../stores/OrderBookStore"
import Conditional from "./CustomComponents/Conditional"
import TradeHistoryTable from "./OrderBook/TradeHistoryTable"

export default class TradeHistory extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            trades: OrderBookStore.getTrades(),
        }

        this.tradesChanged = this.tradesChanged.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.tradesChanged)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.tradesChanged)
    }

    tradesChanged() {
        this.setState({trades: OrderBookStore.getTrades()})
    }

    render() {
        const {trades} = this.state
        const {token} = this.props
        const tokenSymbol = token ? token.symbol : null

        return (
            <Box title="Market Trades" marketResponseSpinner className="market-trades-component last-card">
                <Conditional displayCondition={trades && trades.length > 0}
                             fallbackMessage={'There is no trade history for ' + tokenSymbol}>
                    <TradeHistoryTable base="ETH" token={tokenSymbol} trades={trades}/>
                </Conditional>
            </Box>
        )
    }
}