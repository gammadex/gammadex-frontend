import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import OpenOrdersStore from '../stores/OpenOrdersStore'
import OrdersTable from '../components/OrderBook/OrdersTable'
import TradeStore from '../stores/TradeStore'
import {Box, BoxTitle} from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import Conditional from "./CustomComponents/Conditional"
import {scrollOffersToBottom} from "../util/OffersScroller"

export default class OrderBook extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            bids: OrderBookStore.getBidsDescending(),
            offers: OrderBookStore.getOffersDescending(),
            openOrders: OpenOrdersStore.getOpenOrdersState().openOrders,
            pendingCancelIds: OpenOrdersStore.getOpenOrdersState().pendingCancelIds,
            fillOrderTakerBuy: null,
            fillOrderTakerSell: null,
        }
        this.saveBidsAndOffers = this.saveBidsAndOffers.bind(this)
        this.saveOpenOrders = this.saveOpenOrders.bind(this)
        this.tradeStoreUpdated = this.tradeStoreUpdated.bind(this)
        this.scrollOffers = this.scrollOffers.bind(this)
        this.scrolled = false
    }

    componentDidMount() {
        OrderBookStore.on("change", this.saveBidsAndOffers)
        OpenOrdersStore.on("change", this.saveOpenOrders)
        TradeStore.on("change", this.tradeStoreUpdated)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveBidsAndOffers)
        OpenOrdersStore.removeListener("change", this.saveOpenOrders)
        TradeStore.removeListener("change", this.tradeStoreUpdated)
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.token !== this.props.token) {
            this.scrolled = false
        }

        const offersDiv = document.getElementById("orders-div-offer")
        if (offersDiv && this.state.offers && this.state.offers.length > 0 && !this.scrolled) {
            this.scrollOffers()
        }
    }

    scrollOffers() {
        this.scrolled = scrollOffersToBottom()
    }

    tradeStoreUpdated() {
        const {fillOrderTakerBuy, fillOrderTakerSell} = TradeStore.getTradeState()
        this.setState({
            fillOrderTakerBuy: fillOrderTakerBuy,
            fillOrderTakerSell: fillOrderTakerSell,
        })
    }

    saveBidsAndOffers() {
        this.setState({
            bids: OrderBookStore.getBidsDescending(),
            offers: OrderBookStore.getOffersDescending(),
        })
    }

    saveOpenOrders() {
        this.setState({
            openOrders: OpenOrdersStore.getOpenOrdersState().openOrders,
            pendingCancelIds: OpenOrdersStore.getOpenOrdersState().pendingCancelIds
        })
    }

    render() {
        const {token} = this.props
        const {bids, offers, openOrders, pendingCancelIds, fillOrderTakerBuy, fillOrderTakerSell} = this.state
        const tokenSymbol = token ? token.symbol : null

        const openOrderIds = openOrders.map(o => o.id)

        const bidsContent = <OrdersTable orderType="bid" orders={bids}
                                         openOrderIds={openOrderIds} pendingCancelIds={pendingCancelIds}
                                         rowClass="buy-green"
                                         keepAtBottom={false}
                                         fillOrder={fillOrderTakerSell}/>

        const offersContent = <OrdersTable orderType="offer" orders={offers}
                                           openOrderIds={openOrderIds} pendingCancelIds={pendingCancelIds}
                                           rowClass="sell-red"
                                           keepAtBottom={true}
                                           fillOrder={fillOrderTakerBuy}/>

        return (
            <Box id="bids-and-offers-container" className="bids-and-offers-component full-height-lg">
                <div className="card-header">
                    <BoxTitle title={"Bids and Offers"}
                              ids={{'bids-and-offers-body': 'flex'}}
                              componentId="bids-and-offers-container"
                              onExpand={scrollOffersToBottom}
                    />
                </div>

                <Conditional displayCondition={!token}>
                    <EmptyTableMessage>Please select a token to enable trading</EmptyTableMessage>
                </Conditional>
                <Conditional displayCondition={!!token}>
                    <div id="bids-and-offers-body" className="bids-and-offers mobile-toggle">
                        <div className="bids-and-offers-offers">
                            {offersContent}
                        </div>

                        <div className="orders-col-border bids-and-offers-spacer">
                            <div className="orders-colnames">
                                <table className="table-bordered">
                                    <tbody>
                                    <tr>
                                        <td className="orderbook-col">{tokenSymbol}/ETH</td>
                                        <td>Size {tokenSymbol}</td>
                                        <td>Total ETH</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bids-and-offers-bids">
                            {bidsContent}
                        </div>
                    </div>
                </Conditional>

            </Box>
        )

    }
}