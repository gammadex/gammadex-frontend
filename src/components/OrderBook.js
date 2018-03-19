import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import OpenOrderStore from '../stores/OpenOrdersStore'
import Pagination from './CustomComponents/Pagination'
import OrdersTable from '../components/OrderBook/OrdersTable'
import TokenStats from './OrderBook/TokenStats'
import PlotlyPriceChart from './OrderBook/PlotlyPriceChart'
import PlotlyDepthChart from './OrderBook/PlotlyDepthChart'
//import pptBuys from "../__test-data__/PPT_buys2.json"
//import pptSells from "../__test-data__/PPT_sells2.json"
//import venTrades from '../__test-data__/VenTrades'
import Resizer from './CustomComponents/Resizer'
import * as OrderBookActions from "../actions/OrderBookActions"
import TradeHistoryTable from "./OrderBook/TradeHistoryTable"
import {Box, BoxSection} from "./CustomComponents/Box"

export default class OrderBook extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            bids: [],
            bidsPage: 0,
            numBidsPages: 0,
            offers: [],
            offersPage: 0,
            numOffersPages: 0,
            trades: [],
            tradesPage: 0,
            numTradesPages: 0,
            allTrades: [],
            allBids: [],
            allOffers: [],
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

    changeBidsPage = (page) => {
        OrderBookActions.changeBidsPage(page)
    }

    changeOffersPage = (page) => {
        OrderBookActions.changeOffersPage(page)
    }

    render() {
        const {token, pageSize} = this.props

        const {
            bids, bidsPage, numBidsPages, offers, offersPage, numOffersPages, trades, tradesPage, numTradesPages,
            allTrades, allBids, allOffers, openOrderHashes
        } = this.state

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
