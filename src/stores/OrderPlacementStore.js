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
        this.buyOrderType = OrderType.LIMIT_ORDER
        this.buyOrderPrice = 0
        this.buyOrderAmount = 0
        this.buyOrderTotal = 0
    }

    getOrderPlacementState() {
        return {
            sellOrderType: this.sellOrderType,
            sellOrderPrice: this.sellOrderPrice,
            sellOrderAmount: this.sellOrderAmount,
            sellOrderTotal: this.sellOrderTotal,
            buyOrderType: this.buyOrderType,
            buyOrderPrice: this.buyOrderPrice,
            buyOrderAmount: this.buyOrderAmount,
            buyOrderTotal: this.buyOrderTotal
        }
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.SELL_ORDER_TYPE_CHANGED: {
                this.sellOrderType = action.orderType
                this.sellOrderPrice = action.price
                this.sellOrderAmount = action.amount
                this.sellOrderTotal = action.total
                this.emitChange()
                break
            }
            case ActionNames.BUY_ORDER_TYPE_CHANGED: {
                this.buyOrderType = action.orderType
                this.buyOrderPrice = action.price
                this.buyOrderAmount = action.amount
                this.buyOrderTotal = action.total
                this.emitChange()
                break
            }
            case ActionNames.SELL_ORDER_CHANGED: {
                this.sellOrderPrice = action.price
                this.sellOrderAmount = action.amount
                this.sellOrderTotal = action.total
                this.emitChange()
                break
            }
            case ActionNames.BUY_ORDER_CHANGED: {
                this.buyOrderPrice = action.price
                this.buyOrderAmount = action.amount
                this.buyOrderTotal = action.total
                this.emitChange()
                break
            }
        }
    }
}

const orderPlacementStore = new OrderPlacementStore()
dispatcher.register(orderPlacementStore.handleActions.bind(orderPlacementStore))

export default orderPlacementStore