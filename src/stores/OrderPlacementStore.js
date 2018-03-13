import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import OrderType from "../OrderType";

class OrderPlacementStore extends EventEmitter {
    constructor() {
        super()
        this.sellOrderType = OrderType.LIMIT_ORDER
        this.sellOrderPrice = 0
        this.sellOrderAmount = 0
        this.sellOrderTotal = 0
        this.sellOrderValid = true
        this.sellOrderInvalidReason = ""
        this.buyOrderType = OrderType.LIMIT_ORDER
        this.buyOrderPrice = 0
        this.buyOrderAmount = 0
        this.buyOrderTotal = 0
        this.buyOrderValid = true
        this.buyOrderInvalidReason = ""
        this.tradesToExecute = []
        this.tradesModal = false
    }

    getOrderPlacementState() {
        return {
            sellOrderType: this.sellOrderType,
            sellOrderPrice: this.sellOrderPrice,
            sellOrderAmount: this.sellOrderAmount,
            sellOrderTotal: this.sellOrderTotal,
            sellOrderValid: this.sellOrderValid,
            sellOrderInvalidReason: this.sellOrderInvalidReason,
            buyOrderType: this.buyOrderType,
            buyOrderPrice: this.buyOrderPrice,
            buyOrderAmount: this.buyOrderAmount,
            buyOrderTotal: this.buyOrderTotal,
            buyOrderValid: this.buyOrderValid,
            buyOrderInvalidReason: this.buyOrderInvalidReason,
            tradesToExecute: this.tradesToExecute,
            tradesModal: this.tradesModal
        }
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.SELL_ORDER_TYPE_CHANGED: {
                this.sellOrderType = action.orderType
                this.sellOrderPrice = 0
                this.sellOrderAmount = 0
                this.sellOrderTotal = 0
                this.sellOrderValid = true
                this.sellOrderInvalidReason = ""
                this.emitChange()
                break
            }
            case ActionNames.BUY_ORDER_TYPE_CHANGED: {
                this.buyOrderType = action.orderType
                this.buyOrderPrice = 0
                this.buyOrderAmount = 0
                this.buyOrderTotal = 0
                this.buyOrderValid = true,
                this.buyOrderInvalidReason = ""
                this.emitChange()
                break
            }
            case ActionNames.SELL_ORDER_CHANGED: {
                this.sellOrderPrice = action.price
                this.sellOrderAmount = action.amount
                this.sellOrderTotal = action.total
                this.sellOrderValid = action.orderValid
                this.sellOrderInvalidReason = action.orderInvalidReason
                this.emitChange()
                break
            }
            case ActionNames.BUY_ORDER_CHANGED: {
                this.buyOrderPrice = action.price
                this.buyOrderAmount = action.amount
                this.buyOrderTotal = action.total
                this.buyOrderValid = action.orderValid
                this.buyOrderInvalidReason = action.orderInvalidReason
                this.emitChange()
                break
            }
            case ActionNames.EXECUTE_TRADES: {
                this.tradesToExecute = action.trades
                this.tradesModal = true
                this.emitChange()
                break
            }
            case ActionNames.HIDE_EXECUTE_TRADES_MODAL: {
                //this.tradesToExecute = [], blank this out when the trades are submitted to web3
                this.tradesModal = false
                this.emitChange()
                break
            }                 
        }
    }
}

const orderPlacementStore = new OrderPlacementStore()
dispatcher.register(orderPlacementStore.handleActions.bind(orderPlacementStore))

export default orderPlacementStore