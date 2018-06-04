import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import OpenOrdersStore from '../stores/OpenOrdersStore'
import OrdersTable from '../components/OrderBook/OrdersTable'
import {Box} from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import TokenStore from "../stores/TokenStore"
import Resizer from "./CustomComponents/Resizer"

export default class OrderBook extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            bids: OrderBookStore.getBids(),
            offers: OrderBookStore.getOffersDescending(),
            openOrders: OpenOrdersStore.getOpenOrdersState().openOrders,
            pendingCancelIds: OpenOrdersStore.getOpenOrdersState().pendingCancelIds,
            scrolled: false,
        }
        this.saveBidsAndOffers = this.saveBidsAndOffers.bind(this)
        this.saveOpenOrders = this.saveOpenOrders.bind(this)
        this.updateTitleWidthsAndScroll = this.updateTitleWidthsAndScroll.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveBidsAndOffers)
        OpenOrdersStore.on("change", this.saveOpenOrders)

    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveBidsAndOffers)
        OpenOrdersStore.removeListener("change", this.saveOpenOrders)
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateTitleWidthsAndScroll)
        this.updateTitleWidthsAndScroll()
    }

    componentDidUpdate() {
        this.updateTitleWidthsAndScroll()
    }

    updateTitleWidthsAndScroll() {
        const offersTable = document.getElementById("order-table-offer")
        if (offersTable) {
            this.setState((prevState) => {
                if (prevState.tableWidth !== offersTable.clientWidth) {
                    this.setState({tableWidth: offersTable.clientWidth})
                }
            })
        }

        const offersDiv = document.getElementById("orders-div-offer")
        if (offersDiv) {
            this.setState((prevState) => {
                if (prevState.bids && prevState.bids.length > 0 && !prevState.scrolled) {
                    offersDiv.scrollTop = offersDiv.scrollHeight
                    this.setState({scrolled: true})
                }
            })
        }
    }

    saveBidsAndOffers() {
        this.setState((prevState, props) => ({
            bids: OrderBookStore.getBids(),
            offers: OrderBookStore.getOffersDescending(),
        }))
    }

    saveOpenOrders() {
        this.setState((prevState, props) => ({
            openOrders: OpenOrdersStore.getOpenOrdersState().openOrders,
            pendingCancelIds: OpenOrdersStore.getOpenOrdersState().pendingCancelIds
        }))
    }

    render() {
        const {token, pageSize} = this.props
        const {bids, offers, openOrders, pendingCancelIds, tableWidth} = this.state

        console.log("Width", tableWidth)

        const openOrderIds = openOrders.map(o => o.id)

        let bidsContent = <EmptyTableMessage>There are no bids</EmptyTableMessage>
        if (bids && bids.length > 0) {
            bidsContent = <OrdersTable orderType="bid" orders={bids}
                                       openOrderIds={openOrderIds} pendingCancelIds={pendingCancelIds}
                                       rowClass="buy-green"/>
        }

        let offersContent = <EmptyTableMessage>There are no offers</EmptyTableMessage>
        if (offers && offers.length > 0) {
            offersContent = <OrdersTable orderType="offer" orders={offers}
                                         openOrderIds={openOrderIds} pendingCancelIds={pendingCancelIds}
                                         rowClass="sell-red"/>
        }

        return (
            <Box title="Bids and Offers">
                <div className="col-lg-12">

                    <div className="row">
                        {offersContent}
                    </div>

                    <div className="row orders-col-border">
                        <div className="orders-colnames" style={{"width": `${tableWidth}px`}}>
                            <table className="table-bordered">
                                <tbody>
                                <tr>
                                    <td>{token.name}/ETH</td>
                                    <td>Size ({token.name})</td>
                                    <td>Total (ETH)</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="row">
                        {bidsContent}
                    </div>
                </div>
            </Box>
        )
    }
}