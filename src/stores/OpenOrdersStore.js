import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import OrderState from "../OrderState"
import _ from "lodash"

class OpenOrdersStore extends EventEmitter {
    constructor() {
        super()
        this.openOrders = []
        this.pendingCancelIds = []
        this.showConfirmModal = false
        this.confirmModalOrder = null
        this.gasPriceWei = 0,
        this.showAllTokens = true
    }

    getOpenOrdersState() {
        return {
            openOrders: this.openOrders,
            pendingCancelIds: this.pendingCancelIds,
            showConfirmModal: this.showConfirmModal,
            confirmModalOrder: this.confirmModalOrder,
            gasPriceWei: this.gasPriceWei,
            showAllTokens: this.showAllTokens
        }
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
                    const incomingOrders =  [...action.message.buys, ...action.message.sells]
                    const incomingOrderIds = incomingOrders.map(o => o.id)
                    const openOrdersExcludingIncoming = this.openOrders.filter(o => !incomingOrderIds.includes(o.id))
                    this.openOrders = [...openOrdersExcludingIncoming, ...incomingOrders]
                }
                this.updateAllOpenOrders()
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_MARKET: {
                if (action.message && !_.isUndefined(action.message.myOrders)) {
                    this.openOrders = [...action.message.myOrders.buys, ...action.message.myOrders.sells]
                    this.updateAllOpenOrders()
                    this.emitChange()
                }
                break
            }
            case ActionNames.REQUEST_ORDER_CANCEL: {
                this.showConfirmModal = true
                this.confirmModalOrder = action.openOrder
                this.gasPriceWei = action.gasPriceWei
                this.emitChange()
                break
            }
            case ActionNames.HIDE_CANCEL_ORDER_MODAL: {
                this.showConfirmModal = false
                this.confirmModalOrder = null
                this.gasPriceWei = 0
                this.emitChange()
                break
            }            
            case ActionNames.ADD_PENDING_ORDER_CANCEL: {
                this.pendingCancelIds.push(action.id)
                this.emitChange()
                break
            }
            case ActionNames.REMOVE_PENDING_ORDER_CANCEL: {
                this.pendingCancelIds = this.pendingCancelIds.filter(i => i != action.id)
                this.emitChange()
                break
            }            
            case ActionNames.OPEN_ORDERS_SHOW_ALL_CHANGED: {
                this.showAllTokens = action.showAll
                this.emitChange()
                break
            }      
        }
    }
}

const openOrdersStore = new OpenOrdersStore()
dispatcher.register(openOrdersStore.handleActions.bind(openOrdersStore))

export default openOrdersStore