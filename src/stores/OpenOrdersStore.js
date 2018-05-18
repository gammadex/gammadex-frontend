import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import OrderState from "../OrderState"
import _ from "lodash"

class OpenOrdersStore extends EventEmitter {
    constructor() {
        super()
        this.openOrders = []
    }

    getOpenOrdersState() {
        return {
            openOrders: this.openOrders
        }
    }

    getOpenOrders() {
        return this.openOrders
    }

    emitChange() {
        this.emit("change")
    }

    updateAllOpenOrders() {
        const openOrdersOnly = this.openOrders.filter(o => o.state === OrderState.OPEN)
        this.openOrders = _.reverse(_.sortBy(openOrdersOnly, o => o.updated))
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.MESSAGE_RECEIVED_MY_ORDERS: {
                if (action.message) {
                    const incomingOrderIds = action.message.map(o => o.id)
                    const openOrdersExcludingIncoming = this.openOrders.filter(o => !incomingOrderIds.includes(o.id))
                    this.openOrders = [...openOrdersExcludingIncoming, ...action.message]
                }
                this.updateAllOpenOrders()
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_MARKET: {
                if (action.message && !_.isUndefined(action.message.myOrders)) {
                    this.openOrders = action.message.myOrders
                    this.updateAllOpenOrders()
                    this.emitChange()
                }
                break
            }
        }
    }
}

const openOrdersStore = new OpenOrdersStore()
dispatcher.register(openOrdersStore.handleActions.bind(openOrdersStore))

export default openOrdersStore