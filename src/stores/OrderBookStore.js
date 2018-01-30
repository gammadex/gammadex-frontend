import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

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
                this.bidsPage = 0
                this.offersPage = 0
                this.tradesPage = 0
                this.bids = []
                this.offers = []
                this.trades = []
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_MARKET: {
                // TODO use destructuring with defaults to clean this up (maybe)

                this.bids = []
                this.offers = []
                this.trades = []

                if (action.message
                    && action.message.orders
                    && action.message.orders.buys) {

                    this.bids = action.message.orders.buys
                    this.offers = action.message.orders.sells
                    this.trades = action.message.trades
                }

                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_ORDERS: {
                //this.emitChange()
                break
            }
        }
    }
}

const orderBookStore = new OrderBookStore()
dispatcher.register(orderBookStore.handleActions.bind(orderBookStore))

export default orderBookStore