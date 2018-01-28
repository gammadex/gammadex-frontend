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
        this.bids = []
        this.offers = []
    }

    getBids() {
        return this.bids
    }

    getOffers() {
        return this.offers
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.MESSAGE_RECEIVED_MARKET: {
                // TODO user destructuring with defaults to clean this up
                if (action.message && action.message.orders && action.message.orders.buys) {
                    const {message} = action
                    const {orders} = message
                    const {buys=[], sells=[]} = orders
                    this.bids = buys
                    this.offers = sells
                    this.emitChange()
                }

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