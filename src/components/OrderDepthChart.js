import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import PlotlyDepthChart from './OrderBook/PlotlyDepthChart'
import Resizer from './CustomComponents/Resizer'
import {Box} from "./CustomComponents/Box"

export default class OrderDepthChart extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            allBids: OrderBookStore.getBids(),
            allOffers: OrderBookStore.getOffers(),
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
            allBids: OrderBookStore.getBids(),
            allOffers: OrderBookStore.getOffers(),
        })
    }

    render() {
        const {allBids, allOffers} = this.state

        return (
            <Box title="Order Depth Chart" className="order-depth-chart-component">
                <Resizer><PlotlyDepthChart bids={allBids} offers={allOffers}/></Resizer>
            </Box>
        )
    }
}