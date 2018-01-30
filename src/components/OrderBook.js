import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import Pagination from '../components/Pagination'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import BootstrapTable from 'react-bootstrap-table-next'
import * as OrderBookActions from "../actions/OrderBookActions"

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
            bids: OrderBookStore.getBids(),
            bidsPage: OrderBookStore.getBidsPage(),
            numBidsPages: OrderBookStore.getNumBidsPages(),
            offers: OrderBookStore.getOffers(),
            offersPage: OrderBookStore.getOffersPage(),
            numOffersPages: OrderBookStore.getNumOffersPages(),
            trades: OrderBookStore.getTrades(),
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
        const {token} = this.props
        const {bids, bidsPage, numBidsPages, offers, offersPage, numOffersPages, trades, tradesPage, numTradesPages} = this.state
        const bidColumns = OrderBook.getOrderTableColumns("Bids", token)
        const offersColumns = OrderBook.getOrderTableColumns("Offers", token)
        const tradesColumns = OrderBook.getTradesTableColumns(token)

        return (
            <div>
                <h2>Order Book</h2>
                <div className="row">
                    <div className="col-lg-6">
                        <h3>Bids</h3>
                        <BootstrapTable
                            keyField='id'
                            data={bids}
                            columns={bidColumns}
                            striped
                        />
                        <div class="float-right">
                            <Pagination page={bidsPage} numPages={numBidsPages}
                                        onPageChange={this.changeBidsPage.bind(this)}/>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <h3>Offers</h3>
                        <BootstrapTable
                            keyField='id'
                            data={offers}
                            columns={offersColumns}
                            striped
                        />
                        <div class="float-right">
                            <Pagination page={offersPage} numPages={numOffersPages}
                                        onPageChange={this.changeOffersPage.bind(this)}/>
                        </div>
                    </div>
                </div>

                <h2>Trade History</h2>
                <div className="row">
                    <div className="col-lg-12">
                        <BootstrapTable
                            keyField='txHash'
                            data={trades}
                            columns={tradesColumns}
                            striped
                        />
                        <div class="float-right">
                            <Pagination page={tradesPage} numPages={numTradesPages}
                                        onPageChange={this.changeTradesPage.bind(this)}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    static getOrderTableColumns(tableType, token) {
        return [{
            dataField: 'ethAvailableVolumeBase',
            text: `Total (ETH)`
        }, {
            dataField: 'ethAvailableVolume',
            text: `Size (${token && token.name ? token.name : '...'})`
        }, {
            dataField: 'price',
            text: `${tableType}`
        }];
    }

    static getTradesTableColumns(token) {
        return [{
            dataField: 'price',
            text: `Price`
        }, {
            dataField: 'amountBase',
            text: `Total (ETH)`
        }, {
            dataField: 'amount',
            text: `Total (${token && token.name ? token.name : '...'})`
        }, {
            dataField: 'side',
            text: `Side`
        }, {
            dataField: 'date',
            text: `Time`
        }];
    }

}

