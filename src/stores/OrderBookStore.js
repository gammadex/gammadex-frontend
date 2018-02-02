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

    getBids() {
        return this.sliceForPage(this.bids, this.bidsPage, this.pageSize)
    }

    getNumBidsPages() {
        return Math.ceil(this.bids.length / this.pageSize)
    }

    getBidsPage() {
        return this.bidsPage
    }

    getOffers() {
        return this.sliceForPage(this.offers, this.offersPage, this.pageSize)
    }

    getNumOffersPages() {
        return Math.ceil(this.offers.length / this.pageSize)
    }

    getOffersPage() {
        return this.offersPage
    }

    getTrades() {
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
                this.mergeOrders(action.message)
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

    mergeOrders(message) {
        /*
        const token = TokenStore.getSelectedToken() // TODO - is it acceptable that this has to know about TokenStore?

        if (message && message.buys) {
            const buysForToken = _.filter(message.buys, (buy) => {
                return token.address === buy.tokenGive || token.address === buy.tokenGet
            })

            if (buysForToken.length > 0) {
                const updateBuyIds = new Set(buysForToken.map(b => b.id))
                const currentBuysWithoutUpdates = _.filter(buysForToken, b => ! updateBuyIds.contains(b.id))
                const newBuys = _.filter(buysForToken, b => ! b.deleted)
                const updatedBuys = currentBuysWithoutUpdates.concat(newBuys)

                this.buys = _.sortBy(updatedBuys, (b) => b.) // TODO - working here
            }
        }
        */
    }
}

const orderBookStore = new OrderBookStore()
dispatcher.register(orderBookStore.handleActions.bind(orderBookStore))

export default orderBookStore