import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import OpenOrdersStore from '../stores/OpenOrdersStore'
import OrdersTable from '../components/OrderBook/OrdersTable'
import { Box } from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import OrderBox from "./OrderPlacement/OrderBox"
import OrderBook from "./OrderBook"
import AccountDetail from '../components/AccountDetail'

export default class Trading extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { token } = this.props

        return (
            <div className="row">
                <div className="col-lg-6">
                    <AccountDetail token={token} />
                    <OrderBox tokenName={token.name} />
                </div>
                <div className="col-lg-6">
                    <OrderBook token={token} />
                </div>
            </div>
        )
    }
}