import {EventEmitter} from "events"
import * as OrderMerger from './util/OrderMerger'
import * as TradesMerger from './util/TradesMerger'
import * as MessageUtils from './util/MessageUtils'

import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import TokenStore from '../stores/TokenStore'

class OrderBookStore extends EventEmitter {
    constructor() {
        super()
        this.pageSize = 10
        this.bids = []
        this.offers = []
        this.trades = []
        this.bidsPage = 0
        this.offersPage = 0
        this.tradesPage = 0
    }

    getBidsOnCurrentPage() {
        return this.sliceForPage(this.bids, this.bidsPage, this.pageSize)
    }

    getNumBidsPages() {
        return Math.ceil(this.bids.length / this.pageSize)
    }

    getBidsPage() {
        return this.bidsPage
    }

    getOffersOnCurrentPage() {
        return this.sliceForPage(this.offers, this.offersPage, this.pageSize)
    }

    getNumOffersPages() {
        return Math.ceil(this.offers.length / this.pageSize)
    }

    getOffersPage() {
        return this.offersPage
    }

    getTradesOnCurrentPage() {
        return this.sliceForPage(this.trades, this.tradesPage, this.pageSize)
    }

    getNumTradesPages() {
        return Math.ceil(this.trades.length / this.pageSize)
    }

    getTradesPage() {
        return this.tradesPage
    }

    sliceForPage(list, page, pageSize) {
        const numPagesTotal = Math.floor(1 + list.length / pageSize)
        const actualPage = numPagesTotal < page ? numPagesTotal : page

        return list.slice((actualPage) * pageSize, (actualPage + 1) * pageSize)
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.CHANGE_BIDS_PAGE: {
                this.bidsPage = action.page
                this.emitChange()
                break
            }
            case ActionNames.CHANGE_OFFERS_PAGE: {
                this.offersPage = action.page
                this.emitChange()
                break
            }
            case ActionNames.CHANGE_TRADES_PAGE: {
                this.tradesPage = action.page
                this.emitChange()
                break
            }
            case ActionNames.WEB_SOCKET_OPENED: {
                this.clearState()
                this.emitChange()
                break
            }
            case ActionNames.SELECT_TOKEN: {
                this.clearState()
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_MARKET: {
                this.storeBidsOffersAndTrades(action.message)
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_ORDERS: {
                this.mergeBuysAndSells(action.message)
                this.emitChange()
                break
            }
        }
    }

    clearState() {
        this.bidsPage = 0
        this.offersPage = 0
        this.tradesPage = 0
        this.bids = []
        this.offers = []
        this.trades = []
    }

    storeBidsOffersAndTrades(message) {
        this.bids = []
        this.offers = []
        this.trades = []

        if (message.trades) {
            this.trades = TradesMerger.sortByTimeAndIdRemovingDuplicates(message.trades)
        }

        if (message && message.orders) {
            const orders = message.orders

            if (orders.buys) {
                this.bids = OrderMerger.sortByPriceAndIdRemovingDuplicates(orders.buys, false)
            }
            if (orders.sells) {
                this.offers = OrderMerger.sortByPriceAndIdRemovingDuplicates(orders.sells, true)
            }
        }
    }

    mergeBuysAndSells(message) {
        if (message) {
            const token = TokenStore.getSelectedToken() // TODO - is it acceptable that this has to know about TokenStore?

            if (message.buys) {
                this.buys = OrderMerger.mergeOrders(this.buys, message.buys, token.address, false)
            }
            if (message.sells) {
                this.sells = OrderMerger.mergeOrders(this.sells, message.sells, token.address, true)
            }
        }

    }
}

const orderBookStore = new OrderBookStore()
dispatcher.register(orderBookStore.handleActions.bind(orderBookStore))

export default orderBookStore