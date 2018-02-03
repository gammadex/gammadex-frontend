import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import TokenStore from '../stores/TokenStore'
import _ from "lodash"

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

        if (message && message.orders && message.orders.buys) {
            this.bids = message.orders.buys
            this.offers = message.orders.sells
            this.trades = message.trades
        }
    }

    mergeBuysAndSells(message) {
        if (message) {
            const token = TokenStore.getSelectedToken() // TODO - is it acceptable that this has to know about TokenStore?

            if (message.buys) {
                this.buys = this.mergeOrders(this.buys, message.buys, token.address, false)
            }
            if (message.sells) {
                this.sells = this.mergeOrders(this.sells, message.sells, token.address, true)
            }
        }

    }

    mergeOrders(currentOrders, messageOrders, tokenAddress, ascendingPriceOrder) {
        const ordersForCurrentToken = this.filterOrdersByTokenAddress(messageOrders, tokenAddress)

        if (ordersForCurrentToken.length > 0) {
            const incomingIds = new Set(ordersForCurrentToken.map(b => b.id))
            const unchangedCurrentOrders = _.filter(currentOrders, b => !incomingIds.contains(b.id)) // removes both deletes and updates
            const incomingChangedOrders = _.filter(ordersForCurrentToken, b => !b.deleted)
            const updatedOrdersUnsorted = unchangedCurrentOrders.concat(incomingChangedOrders)
            const updatedOrders = _.sortBy(updatedOrdersUnsorted, b => b.price)

            if (ascendingPriceOrder) {
                return updatedOrders
            } else {
                return _.reverse(updatedOrders)
            }
        } else {
            return currentOrders
        }
    }

    filterOrdersByTokenAddress(message, tokenAddress) {
        return _.filter(message.buys, (buy) => {
            return tokenAddress === buy.tokenGive || tokenAddress === buy.tokenGet
        })
    }
}

const orderBookStore = new OrderBookStore()
dispatcher.register(orderBookStore.handleActions.bind(orderBookStore))

export default orderBookStore