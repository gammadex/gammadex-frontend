import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import { isTakerBuy } from "../OrderUtil"
import OrderSide from "../OrderSide"
import OrderEntryField from "../OrderEntryField"
import { isNull } from "util";

class TradeStore extends EventEmitter {
    constructor() {
        super()
        this.fillAmountInvalidReason = ""
        this.fillAmountInvalidField = OrderEntryField.AMOUNT
        this.fillOrderTakerBuy = null,
        this.fillOrderTakerSell = null,
        this.fillOrderTakerBuyTxHash = null,
        this.fillOrderTakerSellTxHash = null,
        this.fillOrderTakerBuyTxError = null,
        this.fillOrderTakerSellTxError = null
    }

    getTradeState() {
        return {
            fillOrderTakerBuy: this.fillOrderTakerBuy,
            fillOrderTakerSell: this.fillOrderTakerSell,
            fillOrderTakerBuyTxHash: this.fillOrderTakerBuyTxHash,
            fillOrderTakerSellTxHash: this.fillOrderTakerSellTxHash,
            fillOrderTakerBuyTxError: this.fillOrderTakerBuyTxError,
            fillOrderTakerSellTxError: this.fillOrderTakerSellTxError
        }
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.FILL_ORDER: {
                if(isTakerBuy(action.fillOrder.order)) {
                    this.fillOrderTakerBuy = action.fillOrder
                    this.fillOrderTakerBuyTxHash = null,
                    this.fillOrderTakerBuyTxError = null
                } else {
                    this.fillOrderTakerSell = action.fillOrder
                    this.fillOrderTakerSellTxHash = null,
                    this.fillOrderTakerSellTxError = null
                }
                this.emitChange()
                break
            }
            case ActionNames.CLEAR_FILL_ORDER: {
                if(action.takerSide === OrderSide.BUY) {
                    this.fillOrderTakerBuy = null
                    this.fillOrderTakerBuyTxHash = null,
                    this.fillOrderTakerBuyTxError = null
                } else {
                    this.fillOrderTakerSell = null
                    this.fillOrderTakerSellTxHash = null,
                    this.fillOrderTakerSellTxError = null                    
                }
                this.emitChange()
                break
            }
            case ActionNames.FILL_ORDER_CHANGED: {
                if(isTakerBuy(action.updatedFillOrder.order)) {
                    this.fillOrderTakerBuy = action.updatedFillOrder
                } else {
                    this.fillOrderTakerSell = action.updatedFillOrder
                }
                this.emitChange()
                break
            }
            case ActionNames.SENT_TRANSACTION: {
                if(action.takerSide === OrderSide.BUY) {
                    this.fillOrderTakerBuy = null
                    this.fillOrderTakerBuyTxHash = action.txHash,
                    this.fillOrderTakerBuyTxError = null
                } else {
                    this.fillOrderTakerSell = null
                    this.fillOrderTakerSellTxHash = action.txHash,
                    this.fillOrderTakerSellTxError = null                    
                }
                this.emitChange()
                break
            }
            case ActionNames.DISMISS_TRANSACTION_ALERT: {
                if(action.takerSide === OrderSide.BUY) {
                    this.fillOrderTakerBuyTxHash = null,
                    this.fillOrderTakerBuyTxError = null
                } else {
                    this.fillOrderTakerSellTxHash = null,
                    this.fillOrderTakerSellTxError = null                    
                }
                this.emitChange()
                break
            }
            case ActionNames.SEND_TRANSACTION_FAILED: {
                if(action.takerSide === OrderSide.BUY) {
                    this.fillOrderTakerBuy = null,
                    this.fillOrderTakerBuyTxHash = null,
                    this.fillOrderTakerBuyTxError = action.errorMessage
                } else {
                    this.fillOrderTakerSell = null,
                    this.fillOrderTakerSellTxHash = null,
                    this.fillOrderTakerSellTxError = action.errorMessage                    
                }
                this.emitChange()
                break
            }            
        }
    }
}

const tradeStore = new TradeStore()
dispatcher.register(tradeStore.handleActions.bind(tradeStore))

export default tradeStore