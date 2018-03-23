import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import OpenOrdersStore from '../stores/OpenOrdersStore'
import OrdersTable from '../components/OrderBook/OrdersTable'
//import pptBuys from "../__test-data__/PPT_buys2.json"
//import pptSells from "../__test-data__/PPT_sells2.json"
//import venTrades from '../__test-data__/VenTrades'
import {Box} from "./CustomComponents/Box"

export default class OrderBook extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            bids: [],
            offers: [],
            openOrderHashes: OpenOrdersStore.getOpenOrderHashes()
        }
        this.saveBidsAndOffers = this.saveBidsAndOffers.bind(this)
        this.saveOpenOrderHashes = this.saveOpenOrderHashes.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveBidsAndOffers)
        OpenOrdersStore.on("change", this.saveOpenOrderHashes)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveBidsAndOffers)
        OpenOrdersStore.removeListener("change", this.saveOpenOrderHashes)
    }

    saveBidsAndOffers() {
        this.setState((prevState, props) => ({
            bids: OrderBookStore.getBids(),
            offers: OrderBookStore.getOffers(),
        }))
    }

    saveOpenOrderHashes() {
        this.setState({openOrderHashes: OpenOrdersStore.getOpenOrderHashes()})
    }

    render() {
        const {token, pageSize} = this.props
        const {bids, offers, openOrderHashes} = this.state

        return (
            <div className="row">
                <div className="col-lg-6">
                    <Box title="Bids">
                        <OrdersTable base="ETH" token={token.name} orderTypeColName="Bid" orders={bids}
                                     pageSize={pageSize} openOrderHashes={openOrderHashes} rowClass="buy-green"/>
                    </Box>
                </div>

                <div className="col-lg-6">
                    <Box title="Offers">
                        <OrdersTable base="ETH" token={token.name} orderTypeColName="Offer" orders={offers}
                                     pageSize={pageSize} openOrderHashes={openOrderHashes} rowClass="sell-red"/>
                    </Box>
                </div>
            </div>
        )
    }
}