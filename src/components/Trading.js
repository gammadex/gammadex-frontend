import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import OpenOrdersStore from '../stores/OpenOrdersStore'
import OrdersTable from '../components/OrderBook/OrdersTable'
import { Box } from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import OrderBox from "./OrderPlacement/OrderBox"
import OrderBook from "./OrderBook"

export default class Trading extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { token } = this.props

        return (
            <div className="row trading-and-orderbook-component">

            </div>
        )
    }
}