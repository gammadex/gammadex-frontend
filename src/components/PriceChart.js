import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import PlotlyPriceChart from './OrderBook/PlotlyPriceChart'
import PlotlyDepthChart from './OrderBook/PlotlyDepthChart'
import Resizer from './CustomComponents/Resizer'
import Conditional from "./CustomComponents/Conditional"
import {Box, BoxHeader} from "./CustomComponents/Box"
import MarketResponseSpinner from "./MarketResponseSpinner"

export default class PriceChart extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            allTrades: OrderBookStore.getAllTradesSortedByDateAsc(),
        }

        this.saveBidsAndOffers = this.saveBidsAndOffers.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveBidsAndOffers)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveBidsAndOffers)
    }

    saveBidsAndOffers() {
        this.setState({
            allTrades: OrderBookStore.getAllTradesSortedByDateAsc(),
        })
    }

    render() {
        const {allTrades} = this.state
        const {token} = this.props
        const tokenSymbol = token ? token.symbol : null

        return (
            <Box title="Order Depth Chart" className="price-chart-component">
                <Resizer><PlotlyPriceChart trades={allTrades} token={tokenSymbol}/></Resizer>
            </Box>
        )
    }
}