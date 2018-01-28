import React from "react"
import TokenStore from '../stores/TokenStore'
import OrdersTable from '../components/OrderBook/OrdersTable'

export default class OrderBook extends React.Component {
    render() {
        return (
            <div>
                <h2>Order Book</h2>
                <div className="row">
                    <OrdersTable base="ETH" token="VERI" orderTypeTitle="Bids"/>
                    <OrdersTable base="ETH" token="VERI" orderTypeTitle="Offers"/>
                </div>
            </div>
        );
    }
}

