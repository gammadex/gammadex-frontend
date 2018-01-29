import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'

// TODO - set page to 1 when selecting new token
export default class OrderBook extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            bids: [],
            offers: [],
            trades: [],
        }

        this.saveBidsAndOffers = this.saveBidsAndOffers.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveBidsAndOffers)
    }

    saveBidsAndOffers() {
        this.setState((prevState, props) => ({
            bids: OrderBookStore.getBids(),
            offers: OrderBookStore.getOffers(),
            trades: OrderBookStore.getTrades()
        }))
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
        },{
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

    render() {
        const {token} = this.props
        const {bids, offers, trades} = this.state
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
                            pagination={paginationFactory({
                                sizePerPageList: [{
                                    text: '10', value: 10
                                }]
                            })}
                            striped
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
                            striped
                        />
                    </div>
                </div>

                <h2>Trade History</h2>
                <div className="row">
                    <div className="col-lg-12">
                        <BootstrapTable
                            keyField='txHash'
                            data={trades}
                            columns={tradesColumns}
                            pagination={paginationFactory({
                                sizePerPageList: [{
                                    text: '10', value: 10
                                }]
                            })}
                            striped
                        />
                    </div>
                </div>
            </div>
        )
    }
}

