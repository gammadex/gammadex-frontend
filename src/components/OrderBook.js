import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import OrdersTable from '../components/OrdersTable'
import uuid from 'uuid'

export default class OrderBook extends React.Component {
    constructor() {
        super()
        this.state = {
            token: null,
            pendingToken: null,
            bids: [],
            bidsPage: 0,
            numBidsPages: 1,
            offers: [],
            offersPage: 0,
            numOffersPages: 1,
        }
        this.saveTokenBidsAndOffers = this.saveTokenBidsAndOffers.bind(this)
        this.saveTokenBidsAndOffers()
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveTokenBidsAndOffers)
    }

    saveTokenBidsAndOffers() {
        const state = this.state
        state.pendingToken = OrderBookStore.getPendingToken()
        state.token = OrderBookStore.getCurrentToken()
        state.bids = OrderBookStore.getBidsOnCurrentPage()
        state.offers = OrderBookStore.getOffersOnCurrentPage()
        this.setState(state)
    }

    render() {
        const {bids, offers, token, pendingToken} = this.state

        return (
            <div>
                <h2>Order Book</h2>
                <div className="row">
                    <OrdersTable base="ETH" token={token} pendingToken={pendingToken} orderTypeTitle="Bids" orderTypeColName="Bid" orders={bids}/>
                    <OrdersTable base="ETH" token={token} pendingToken={pendingToken} orderTypeTitle="Offers" orderTypeColName="Offer" orders={offers}/>
                </div>
            </div>
        )
    }
}

