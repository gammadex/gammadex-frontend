import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import OpenOrdersStore from '../stores/OpenOrdersStore'
import OrdersTable from '../components/OrderBook/OrdersTable'
import { Box } from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"

export default class OrderBook extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            bids: OrderBookStore.getBids(),
            offers: OrderBookStore.getOffers(),
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
        this.setState((prevState, props) => ({
            bids: OrderBookStore.getBids(),
            offers: OrderBookStore.getOffers(),
        }))
    }

    render() {
        const { token, pageSize } = this.props
        const { bids, offers } = this.state

        let bidsContent = <EmptyTableMessage>There are no bids</EmptyTableMessage>
        if (bids && bids.length > 0) {
            bidsContent = <OrdersTable base="ETH" token={token.name} orderTypeColName="Bid" orders={bids}
                pageSize={pageSize} rowClass="buy-green" />
        }

        let offersContent = <EmptyTableMessage>There are no offers</EmptyTableMessage>
        if (offers && offers.length > 0) {
            offersContent = <OrdersTable base="ETH" token={token.name} orderTypeColName="Offer" orders={offers}
                pageSize={pageSize} rowClass="sell-red" />
        }

        return (

            <span>
                <Box title="Offers">
                    {offersContent}
                </Box>

                <Box title="Bids">
                    {bidsContent}
                </Box>
            </span>
        )
    }
}