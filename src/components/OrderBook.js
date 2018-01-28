import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import TokenStore from '../stores/TokenStore'
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
            offers: [],
        }

        this.saveBidsAndOffers = this.saveBidsAndOffers.bind(this)
        this.saveToken = this.saveToken.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveBidsAndOffers)
        TokenStore.on("change", this.saveToken)
    }

    saveBidsAndOffers() {
        const state = this.state
        state.bids = OrderBookStore.getBids()
        state.offers = OrderBookStore.getOffers()
        this.setState(state)
    }

    saveToken() {
        const state = this.state
        state.token = TokenStore.getSelectedToken()
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

