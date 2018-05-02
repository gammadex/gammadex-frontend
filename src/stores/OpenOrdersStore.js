import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import OrderState from "../OrderState"

// TODO hydrate from gammadex backend
class OpenOrdersStore extends EventEmitter {
    constructor() {
        super()
        if(localStorage.openOrders) {
            this.openOrders = JSON.parse(localStorage.openOrders)
        } else {
            this.openOrders = []
        }
    }

    getOpenOrdersState() {
        return {
            openOrders: this.openOrders
        }
    }

    getOpenOrderHashes() {
        return this.openOrders.filter(o => o.state !== OrderState.CLOSED).map(o => o.hash.toLowerCase())
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.ADD_OPEN_ORDER: {
                this.openOrders.push(action.openOrder)
                this.emitChange()
                break
            }
            case ActionNames.CANCEL_OPEN_ORDER: {
                this.openOrders.filter(openOrder => openOrder.hash === action.orderHash).forEach(openOrder => {
                    openOrder.state = OrderState.PENDING_CANCEL
                    openOrder.pendingCancelTx = action.txHash
                })
                this.emitChange()
                break
            }
            case ActionNames.CANCEL_OPEN_ORDER_SUCCEEDED: {
                this.openOrders.filter(openOrder => openOrder.hash === action.orderHash).forEach(openOrder => {
                    openOrder.state = OrderState.CLOSED
                    openOrder.pendingCancelTx = null
                })
                this.emitChange()
                break
            }
            case ActionNames.CANCEL_OPEN_ORDER_FAILED: {
                this.openOrders.filter(openOrder => openOrder.hash === action.orderHash).forEach(openOrder => {
                    openOrder.state = OrderState.OPEN
                    openOrder.pendingCancelTx = null
                })
                this.emitChange()
                break
            }
            case ActionNames.OPEN_ORDERS_PURGED: {
                this.openOrders = []
                this.emitChange()
                break
            }
        }
        localStorage.openOrders = JSON.stringify(this.openOrders)
    }
}

const openOrdersStore = new OpenOrdersStore()
dispatcher.register(openOrdersStore.handleActions.bind(openOrdersStore))

export default openOrdersStore