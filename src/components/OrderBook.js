import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import OrdersTable from '../components/OrdersTable'
import uuid from 'uuid'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import Config from '../Config'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'

export default class OrderBook extends React.Component {
    constructor() {
        super()
        this.state = {
            token: Config.getDefaultToken(),
            pendingToken: null,
            bids: [],
            bidsPage: 0,
            numBidsPages: 1,
            offers: [],
            offersPage: 0,
            numOffersPages: 1,
        }
        this.saveTokenBidsAndOffers = this.saveTokenBidsAndOffers.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveTokenBidsAndOffers)
    }

    saveTokenBidsAndOffers() {
        const state = this.state
        state.pendingToken = OrderBookStore.getPendingToken()
        state.token = OrderBookStore.getCurrentToken()
        state.bids = OrderBookStore.getBids()
        state.offers = OrderBookStore.getOffers()
        this.setState(state)
    }

    static getColumns(tableType, token) {
        const bidColumns = [{
            dataField: 'ethAvailableVolumeBase',
            text: `Total (ETH)`
        }, {
            dataField: 'ethAvailableVolume',
            text: `Size (${token && token.name ? token.name : '...'})`
        }, {
            dataField: 'price',
            text: `${tableType}`
        }];

        return bidColumns
    }

    render() {
        const {bids, offers, token, pendingToken} = this.state
        const tkn = token ? token : pendingToken
        const bidColumns = OrderBook.getColumns("Bids", tkn)
        const offersColumns = OrderBook.getColumns("Offers", tkn)

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
                            pagination={paginationFactory({
                                sizePerPageList: [{
                                    text: '10', value: 10
                                }]
                            })}
                        />
                    </div>

                    <div className="col-lg-6">
                        <h3>Offers</h3>
                        <BootstrapTable
                            keyField='id'
                            data={offers}
                            columns={offersColumns}
                            pagination={paginationFactory({
                                sizePerPageList: [{
                                    text: '10', value: 10
                                }]
                            })}
                        />
                    </div>
                </div>
            </div>

        )
    }
}

