import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import OpenOrderStore from '../stores/OpenOrdersStore'
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
            openOrderHashes: OpenOrderStore.getOpenOrderHashes()
        }
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveBidsAndOffers)
        OpenOrderStore.on("change", () => this.setState({openOrderHashes: OpenOrderStore.getOpenOrderHashes()}))
    }

    saveBidsAndOffers = () => {
        this.setState((prevState, props) => ({
            bids: OrderBookStore.getBids(),
            offers: OrderBookStore.getOffers(),
        }))
    }

    render() {
        const {token, pageSize} = this.props
        const {bids, offers, openOrderHashes} = this.state

        return (
            <span>
                <Box title="Bids">
                    <OrdersTable base="ETH" token={token.name} orderTypeColName="Bid" orders={bids}
                                 pageSize={pageSize} openOrderHashes={openOrderHashes}/>
                </Box>

                <Box title="Offers">
                    <OrdersTable base="ETH" token={token.name} orderTypeColName="Offer" orders={offers}
                                 pageSize={pageSize} openOrderHashes={openOrderHashes}/>
                </Box>
            </span>
        )
    }
}
