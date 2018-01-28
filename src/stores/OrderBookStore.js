import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import uuid from 'uuid'
import ActionNames from "../actions/ActionNames"
import Config from '../Config'

/**
 * TODO - move all the token shit into the TokenStore
 */
class OrderBookStore extends EventEmitter {
    constructor() {
        super()
        this.pendingToken = Config.getDefaultToken().name
        this.currentToken = null
        this.bids = []
        this.offers = []
        this.pageSize = 10
        this.bidsPage = 1
        this.offersPage = 1
    }

    getBids() {
        return this.bids
    }

    getOffers() {
        return this.offers
    }

    getBidsOnCurrentPage() {
        return this.sliceForPage(this.bids, this.bidsPage, this.pageSize)
    }

    getOffersOnCurrentPage() {
        return this.sliceForPage(this.offers, this.offersPage, this.pageSize)
    }

    getPendingToken() {
        return this.pendingToken
    }

    getCurrentToken() {
        return this.currentToken
    }

    // 1 indexed pages
    sliceForPage(list, page, pageSize) {
        const numPagesTotal = Math.ceil(list.length / pageSize)
        const actualPage = numPagesTotal < page ? numPagesTotal : page

        return list.slice((actualPage - 1) * pageSize, actualPage * pageSize)
    }


    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.TOKEN_SELECTED: {
                this.bids = []
                this.offers = []
                this.pendingToken = action.token.name
                this.currentToken = null
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_MARKET: {
                console.log("woot")
                const {message} = action
                const {orders} = message
                const {buys=[], sells=[]} = orders // TODO assign buys,sells from action in one line
                this.bids = buys
                this.offers = sells
                this.currentToken = this.pendingToken
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_ORDERS: {
                this.emitChange()
                break
            }
        }
    }
}

const orderBookStore = new OrderBookStore()
dispatcher.register(orderBookStore.handleActions.bind(orderBookStore))

export default orderBookStore