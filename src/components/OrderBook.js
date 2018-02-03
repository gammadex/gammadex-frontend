import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import Pagination from '../components/Pagination'
import OrdersTable from '../components/OrderBook/OrdersTable'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import BootstrapTable from 'react-bootstrap-table-next'
import * as OrderBookActions from "../actions/OrderBookActions"
import TradeHistoryTable from "./OrderBook/TradeHistoryTable"

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
        }

        this.saveBidsAndOffers = this.saveBidsAndOffers.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveBidsAndOffers)
    }

    saveBidsAndOffers() {
        this.setState((prevState, props) => ({
            bids: OrderBookStore.getBidsOnCurrentPage(),
            bidsPage: OrderBookStore.getBidsPage(),
            numBidsPages: OrderBookStore.getNumBidsPages(),
            offers: OrderBookStore.getOffersOnCurrentPage(),
            offersPage: OrderBookStore.getOffersPage(),
            numOffersPages: OrderBookStore.getNumOffersPages(),
            trades: OrderBookStore.getTradesOnCurrentPage(),
            tradesPage: OrderBookStore.getTradesPage(),
            numTradesPages: OrderBookStore.getNumTradesPages(),
        }))
    }

    changeBidsPage(page) {
        OrderBookActions.changeBidsPage(page)
    }

    changeOffersPage(page) {
        OrderBookActions.changeOffersPage(page)
    }

    changeTradesPage(page) {
        OrderBookActions.changeTradesPage(page)
    }

    render() {
        const {token, pageSize} = this.props
        const {bids, bidsPage, numBidsPages, offers, offersPage, numOffersPages, trades, tradesPage, numTradesPages} = this.state

        return (
            <div>
                <h2>Order Book</h2>
                <div className="row">
                    <div className="col-lg-6">
                        <h3>Bids</h3>
                        <OrdersTable base="ETH" token={token.name} orderTypeColName="Bid" orders={bids}
                                     pageSize={pageSize}/>

                        <div className="float-right">
                            <Pagination page={bidsPage} numPages={numBidsPages}
                                        onPageChange={this.changeBidsPage.bind(this)}/>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <h3>Offers</h3>
                        <OrdersTable base="ETH" token={token.name} orderTypeColName="Offers" orders={offers}
                                     pageSize={pageSize}/>

                        <div className="float-right">
                            <Pagination page={offersPage} numPages={numOffersPages}
                                        onPageChange={this.changeOffersPage.bind(this)}/>
                        </div>
                    </div>
                </div>

                <h2>Trade History</h2>
                <div className="row">
                    <div className="col-lg-12">
                        <TradeHistoryTable base="ETH" token={token.name} trades={trades} pageSize={pageSize}/>

                        <div className="float-right">
                            <Pagination page={tradesPage} numPages={numTradesPages}
                                        onPageChange={this.changeTradesPage.bind(this)}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

