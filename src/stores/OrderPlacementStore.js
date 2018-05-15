import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import BigNumber from 'bignumber.js'
import ExpiryType from "../ExpiryType"
import OrderEntryField from "../OrderEntryField"

class OrderPlacementStore extends EventEmitter {
    constructor() {
        super()
        this.sellOrderPriceControlled = ""
        this.sellOrderAmountControlled = ""
        this.sellOrderAmountWei = BigNumber(0)
        this.sellOrderTotalEthControlled = ""
        this.sellOrderTotalEthWei = BigNumber(0)
        this.sellOrderExpiryType = ExpiryType.GOOD_TILL_CANCEL
        this.sellOrderExpireAfterBlocks = 10000
        this.sellOrderExpireHumanReadableString = ""
        this.sellOrderValid = true
        this.sellOrderInvalidReason = ""
        this.sellOrderInvalidField = OrderEntryField.AMOUNT
        this.sellOrderHasPriceWarning = false
        this.sellOrderPriceWarning = ""
        this.sellOrderHash = ""
        this.buyOrderPriceControlled = ""
        this.buyOrderAmountControlled = ""
        this.buyOrderAmountWei = BigNumber(0)
        this.buyOrderTotalEthControlled = ""
        this.buyOrderTotalEthWei = BigNumber(0)
        this.buyOrderExpiryType = ExpiryType.GOOD_TILL_CANCEL
        this.buyOrderExpireAfterBlocks = 10000
        this.buyOrderExpireHumanReadableString = ""
        this.buyOrderValid = true
        this.buyOrderInvalidReason = ""
        this.buyOrderInvalidField = OrderEntryField.AMOUNT
        this.buyOrderHasPriceWarning = false
        this.buyOrderPriceWarning = ""
        this.buyOrderHash = ""        
        this.tradesToExecute = []
        this.tradesModal = false
        this.orderModal = false
        this.order = null
    }

    getOrderPlacementState() {
        return {
            sellOrderPriceControlled: this.sellOrderPriceControlled,
            sellOrderAmountControlled: this.sellOrderAmountControlled,
            sellOrderAmountWei: this.sellOrderAmountWei,
            sellOrderTotalEthControlled: this.sellOrderTotalEthControlled,
            sellOrderTotalEthWei: this.sellOrderTotalEthWei,
            sellOrderExpiryType: this.sellOrderExpiryType,
            sellOrderExpireAfterBlocks: this.sellOrderExpireAfterBlocks,
            sellOrderExpireHumanReadableString: this.sellOrderExpireHumanReadableString,
            sellOrderValid: this.sellOrderValid,
            sellOrderInvalidReason: this.sellOrderInvalidReason,
            sellOrderInvalidField: this.sellOrderInvalidField,
            sellOrderHasPriceWarning: this.sellOrderHasPriceWarning,
            sellOrderPriceWarning: this.sellOrderPriceWarning,
            sellOrderHash: this.sellOrderHash,
            buyOrderPriceControlled: this.buyOrderPriceControlled,
            buyOrderAmountControlled: this.buyOrderAmountControlled,
            buyOrderAmountWei: this.buyOrderAmountWei,
            buyOrderTotalEthControlled: this.buyOrderTotalEthControlled,
            buyOrderTotalEthWei: this.buyOrderTotalEthWei,
            buyOrderExpiryType: this.buyOrderExpiryType,
            buyOrderExpireAfterBlocks: this.buyOrderExpireAfterBlocks,
            buyOrderExpireHumanReadableString: this.buyOrderExpireHumanReadableString,
            buyOrderValid: this.buyOrderValid,
            buyOrderInvalidReason: this.buyOrderInvalidReason,
            buyOrderInvalidField: this.buyOrderInvalidField,
            buyOrderHasPriceWarning: this.buyOrderHasPriceWarning,
            buyOrderPriceWarning: this.buyOrderPriceWarning,     
            buyOrderHash: this.buyOrderHash,       
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
            case ActionNames.BUY_ORDER_EXPIRY_CHANGED: {
                this.buyOrderExpiryType = action.expiryType
                this.buyOrderExpireAfterBlocks = action.expireAfterBlocks
                this.buyOrderExpireHumanReadableString = action.expireAfterHumanReadableString
                this.buyOrderHash = action.hash
                this.buyOrderValid = action.orderValid,
                this.buyOrderInvalidReason = action.orderInvalidReason,
                this.buyOrderInvalidField = action.orderInvalidField
                this.emitChange()
                break
            }
            case ActionNames.SELL_ORDER_EXPIRY_CHANGED: {
                this.sellOrderExpiryType = action.expiryType
                this.sellOrderExpireAfterBlocks = action.expireAfterBlocks
                this.sellOrderExpireHumanReadableString = action.expireAfterHumanReadableString
                this.sellOrderHash = action.hash
                this.sellOrderValid = action.orderValid,
                this.sellOrderInvalidReason = action.orderInvalidReason,
                this.sellOrderInvalidField = action.orderInvalidField
                this.emitChange()
                break
            }            
            case ActionNames.SELL_ORDER_PRICE_CHANGED: {
                this.sellOrderPriceControlled = action.priceControlled
                this.sellOrderTotalEthWei = action.totalEthWei
                this.sellOrderTotalEthControlled = action.totalEthControlled
                this.sellOrderValid = action.orderValid
                this.sellOrderInvalidReason = action.orderInvalidReason
                this.sellOrderInvalidField = action.orderInvalidField
                this.sellOrderHasPriceWarning = action.hasPriceWarning
                this.sellOrderPriceWarning = action.priceWarning
                this.sellOrderHash = action.hash
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
                this.sellOrderInvalidField = action.orderInvalidField
                this.sellOrderHasPriceWarning = action.hasPriceWarning
                this.sellOrderPriceWarning = action.priceWarning       
                this.sellOrderHash = action.hash         
                this.emitChange()
                break
            }
            case ActionNames.SELL_ORDER_TOTAL_CHANGED: {
                this.sellOrderAmountControlled = action.amountControlled
                this.sellOrderAmountWei = action.amountWei
                this.sellOrderTotalEthWei = action.totalEthWei
                this.sellOrderTotalEthControlled = action.totalEthControlled
                this.sellOrderPriceControlled = action.priceControlled
                this.sellOrderValid = action.orderValid
                this.sellOrderInvalidReason = action.orderInvalidReason
                this.sellOrderInvalidField = action.orderInvalidField
                this.sellOrderHasPriceWarning = action.hasPriceWarning
                this.sellOrderPriceWarning = action.priceWarning     
                this.sellOrderHash = action.hash           
                this.emitChange()
                break
            }
            case ActionNames.BUY_ORDER_PRICE_CHANGED: {
                this.buyOrderPriceControlled = action.priceControlled
                this.buyOrderTotalEthWei = action.totalEthWei
                this.buyOrderTotalEthControlled = action.totalEthControlled
                this.buyOrderValid = action.orderValid
                this.buyOrderInvalidReason = action.orderInvalidReason
                this.buyOrderInvalidField = action.orderInvalidField
                this.buyOrderHasPriceWarning = action.hasPriceWarning
                this.buyOrderPriceWarning = action.priceWarning
                this.buyOrderHash = action.hash
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
                this.buyOrderInvalidField = action.orderInvalidField
                this.buyOrderHasPriceWarning = action.hasPriceWarning
                this.buyOrderPriceWarning = action.priceWarning    
                this.buyOrderHash = action.hash    
                this.emitChange()
                break
            }
            case ActionNames.BUY_ORDER_TOTAL_CHANGED: {
                this.buyOrderAmountControlled = action.amountControlled
                this.buyOrderAmountWei = action.amountWei
                this.buyOrderTotalEthWei = action.totalEthWei
                this.buyOrderTotalEthControlled = action.totalEthControlled
                this.buyOrderPriceControlled = action.priceControlled
                this.buyOrderValid = action.orderValid
                this.buyOrderInvalidReason = action.orderInvalidReason
                this.buyOrderInvalidField = action.orderInvalidField
                this.buyOrderHasPriceWarning = action.hasPriceWarning
                this.buyOrderPriceWarning = action.priceWarning    
                this.buyOrderHash = action.hash    
                this.emitChange()
                break
            }
            case ActionNames.SELL_ORDER_PRICE_WARNING_DISMISSED: {
                this.sellOrderHasPriceWarning = false
                this.sellOrderPriceWarning = ""
                this.emitChange()
                break
            }
            case ActionNames.BUY_ORDER_PRICE_WARNING_DISMISSED: {
                this.buyOrderHasPriceWarning = false
                this.buyOrderPriceWarning = ""
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