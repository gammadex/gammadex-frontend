import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import uuid from 'uuid'
import ActionNames from "../actions/ActionNames"
import Config from '../Config'

class OrderBookStore extends EventEmitter {
    constructor() {
        super()
        this.pendingToken = Config.getDefaultToken().name
        this.currentToken = null
        this.bids = [
            {
                id: uuid.v4(),
                ethAvailableVolumeBase: 1,
                ethAvailableVolume: 4567,
                price: 0.00123456
            },
        ]
        this.offers = [
            {
                id: uuid.v4(),
                ethAvailableVolumeBase: 1,
                ethAvailableVolume: 564,
                price: 0.00124000
            },
        ]
        this.pageSize = 10
        this.bidsPage = 1
        this.offersPage = 1
    }

    // 1 indexed pages
    sliceForPage(list, page, pageSize) {
        const numPagesTotal = Math.ceil(list.length / pageSize)
        const actualPage = numPagesTotal < page ? numPagesTotal : page

        return list.slice((actualPage - 1) * pageSize, actualPage * pageSize)
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