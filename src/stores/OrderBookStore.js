import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

class OrderBookStore extends EventEmitter {
    constructor() {
        super()
        this.bids = []
        this.offers = []
        this.trades = []
    }

    getBids() {
        return this.bids
    }

    getOffers() {
        return this.offers
    }

    getTrades() {
        return this.trades
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
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