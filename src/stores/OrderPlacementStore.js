import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import OrderType from "../OrderType";
import BigNumber from 'bignumber.js'

class OrderPlacementStore extends EventEmitter {
    constructor() {
        super()
        this.sellOrderType = OrderType.LIMIT_ORDER
        this.sellOrderPriceControlled = 0
        this.sellOrderAmountControlled = 0
        this.sellOrderAmountWei = BigNumber(0)
        this.sellOrderTotalEthControlled = 0
        this.sellOrderTotalEthWei = BigNumber(0)
        this.sellOrderValid = true
        this.sellOrderInvalidReason = ""
        this.buyOrderType = OrderType.LIMIT_ORDER
        this.buyOrderPriceControlled = 0
        this.buyOrderAmountControlled = 0
        this.buyOrderAmountWei = BigNumber(0)
        this.buyOrderTotalEthControlled = 0
        this.buyOrderTotalEthWei = BigNumber(0)
        this.buyOrderValid = true
        this.buyOrderInvalidReason = ""
        this.tradesToExecute = []
        this.tradesModal = false
        this.orderModal = false
        this.order = null
    }

    getOrderPlacementState() {
        return {
            sellOrderType: this.sellOrderType,
            sellOrderPriceControlled: this.sellOrderPriceControlled,
            sellOrderAmountControlled: this.sellOrderAmountControlled,
            sellOrderAmountWei: this.sellOrderAmountWei,
            sellOrderTotalEthControlled: this.sellOrderTotalEthControlled,
            sellOrderTotalEthWei: this.sellOrderTotalEthWei,
            sellOrderValid: this.sellOrderValid,
            sellOrderInvalidReason: this.sellOrderInvalidReason,
            buyOrderType: this.buyOrderType,
            buyOrderPriceControlled: this.buyOrderPriceControlled,
            buyOrderAmountControlled: this.buyOrderAmountControlled,
            buyOrderAmountWei: this.buyOrderAmountWei,
            buyOrderTotalEthControlled: this.buyOrderTotalEthControlled,
            buyOrderTotalEthWei: this.buyOrderTotalEthWei,
            buyOrderValid: this.buyOrderValid,
            buyOrderInvalidReason: this.buyOrderInvalidReason,
            tradesToExecute: this.tradesToExecute,
            tradesModal: this.tradesModal,
            orderModal: this.orderModal,
            order: this.order
        }
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.SELL_ORDER_TYPE_CHANGED: {
                this.sellOrderType = action.orderType
                this.sellOrderPriceControlled = 0
                this.sellOrderAmountControlled = 0
                this.sellOrderAmountWei = BigNumber(0)
                this.sellOrderTotalEthControlled = 0
                this.sellOrderTotalEthWei = BigNumber(0)
                this.sellOrderValid = true
                this.sellOrderInvalidReason = ""
                this.emitChange()
                break
            }
            case ActionNames.BUY_ORDER_TYPE_CHANGED: {
                this.buyOrderType = action.orderType
                this.buyOrderPriceControlled = 0
                this.buyOrderAmountControlled = 0
                this.buyOrderAmountWei = BigNumber(0)
                this.buyOrderTotalEthControlled = 0
                this.buyOrderTotalEthWei = BigNumber(0)
                this.buyOrderValid = true
                this.buyOrderInvalidReason = ""
                this.emitChange()
                break
            }
            case ActionNames.SELL_ORDER_PRICE_CHANGED: {
                this.sellOrderPriceControlled = action.priceControlled
                this.sellOrderTotalEthWei = action.totalEthWei
                this.sellOrderTotalEthControlled = action.totalEthControlled
                this.sellOrderValid = action.orderValid
                this.sellOrderInvalidReason = action.orderInvalidReason
                this.emitChange()
                break
            }
            case ActionNames.SELL_ORDER_AMOUNT_CHANGED: {
                this.sellOrderAmountControlled = action.amountControlled
                this.sellOrderAmountWei = action.amountWei
                this.sellOrderTotalEthWei = action.totalEthWei
                this.sellOrderTotalEthControlled = action.totalEthControlled
                this.sellOrderValid = action.orderValid
                this.sellOrderInvalidReason = action.orderInvalidReason
                this.emitChange()
                break
            }
            case ActionNames.SELL_ORDER_TOTAL_CHANGED: {
                this.sellOrderAmountControlled = action.amountControlled
                this.sellOrderAmountWei = action.amountWei
                this.sellOrderTotalEthWei = action.totalEthWei
                this.sellOrderTotalEthControlled = action.totalEthControlled
                this.sellOrderValid = action.orderValid
                this.sellOrderInvalidReason = action.orderInvalidReason
                this.emitChange()
                break
            }
            case ActionNames.BUY_ORDER_PRICE_CHANGED: {
                this.buyOrderPriceControlled = action.priceControlled
                this.buyOrderTotalEthWei = action.totalEthWei
                this.buyOrderTotalEthControlled = action.totalEthControlled
                this.buyOrderValid = action.orderValid
                this.buyOrderInvalidReason = action.orderInvalidReason
                this.emitChange()
                break
            }
            case ActionNames.BUY_ORDER_AMOUNT_CHANGED: {
                this.buyOrderAmountControlled = action.amountControlled
                this.buyOrderAmountWei = action.amountWei
                this.buyOrderTotalEthWei = action.totalEthWei
                this.buyOrderTotalEthControlled = action.totalEthControlled
                this.buyOrderValid = action.orderValid
                this.buyOrderInvalidReason = action.orderInvalidReason
                this.emitChange()
                break
            }
            case ActionNames.BUY_ORDER_TOTAL_CHANGED: {
                this.buyOrderAmountControlled = action.amountControlled
                this.buyOrderAmountWei = action.amountWei
                this.buyOrderTotalEthWei = action.totalEthWei
                this.buyOrderTotalEthControlled = action.totalEthControlled
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
            case ActionNames.CREATE_ORDER: {
                this.order = action.order
                this.orderModal = true
                this.emitChange()
                break
            }
            case ActionNames.HIDE_CREATE_ORDER_MODAL: {
                this.orderModal = false
                this.emitChange()
                break
            }
        }
    }
}

const orderPlacementStore = new OrderPlacementStore()
dispatcher.register(orderPlacementStore.handleActions.bind(orderPlacementStore))

export default orderPlacementStore