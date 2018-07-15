import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import OpenOrdersStore from '../stores/OpenOrdersStore'
import OrdersTable from '../components/OrderBook/OrdersTable'
import TradeStore from '../stores/TradeStore'
import {Box} from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import Conditional from "./CustomComponents/Conditional"

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
        this.updateTitleWidths = this.updateTitleWidths.bind(this)
        this.tradeStoreUpdated = this.tradeStoreUpdated.bind(this)
    }

    componentDidMount() {
        OrderBookStore.on("change", this.saveBidsAndOffers)
        OpenOrdersStore.on("change", this.saveOpenOrders)
        TradeStore.on("change", this.tradeStoreUpdated)
        window.addEventListener("resize", this.updateTitleWidths)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveBidsAndOffers)
        OpenOrdersStore.removeListener("change", this.saveOpenOrders)
        TradeStore.removeListener("change", this.tradeStoreUpdated)
        window.removeEventListener("resize", this.updateTitleWidths)
    }

    componentDidUpdate(prevProps, prevState) {
        const offersTable = document.getElementById("order-table-offer")
        if (offersTable) {
            if (prevState.tableWidth !== offersTable.clientWidth) {
                this.updateTitleWidths()
            }
        }
    }

    updateTitleWidths() {
        const offersTable = document.getElementById("order-table-offer")
        if (offersTable) {
            this.setState((prevState) => {
                if (prevState.tableWidth !== offersTable.clientWidth) {
                    return {tableWidth: offersTable.clientWidth}
                }
            })
        }
    }

    tradeStoreUpdated() {
        const { fillOrderTakerBuy, fillOrderTakerSell} = TradeStore.getTradeState()
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
        const {bids, offers, openOrders, pendingCancelIds, tableWidth, fillOrderTakerBuy, fillOrderTakerSell} = this.state
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
            <Box title="Bids and Offers" className="full-height">

                <Conditional displayCondition={!token}>
                    <EmptyTableMessage>Please select a token to enable trading</EmptyTableMessage>
                </Conditional>
                <Conditional displayCondition={!!token}>
                    <div className="bids-and-offers">
                        <div className="bids-and-offers-offers">
                            {offersContent}
                        </div>

                        <div className="orders-col-border bids-and-offers-spacer">
                            <div className="orders-colnames" style={{"width": `${tableWidth}px`}}>
                                <table className="table-bordered">
                                    <tbody>
                                    <tr>
                                        <td>{tokenSymbol}/ETH</td>
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