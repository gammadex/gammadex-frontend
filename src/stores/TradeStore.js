import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import { isTakerBuy } from "../OrderUtil"
import OrderSide from "../OrderSide"
import FillOrderField from "../FillOrderField"
import { isNull } from "util";

class TradeStore extends EventEmitter {
    constructor() {
        super()
        this.modal = false
        this.modalOrder = null
        this.weiFillAmount = 0
        this.fillAmountControlled = 0
        this.weiTotalEth = 0
        this.totalEthControlled = 0
        this.fillAmountValid = true
        this.fillAmountInvalidReason = ""
        this.fillAmountInvalidField = FillOrderField.AMOUNT
        this.showTransactionModal = false
        this.transactionHash = ""
        this.transactionModalIsError = false
        this.transactionModalErrorText = ""
        this.fillOrderTakerBuy = null,
        this.fillOrderTakerSell = null,
        this.fillOrderTakerBuyTxHash = null,
        this.fillOrderTakerSellTxHash = null,
        this.fillOrderTakerBuyTxError = null,
        this.fillOrderTakerSellTxError = null
    }

    getTradeState() {
        return {
            modal: this.modal,
            modalOrder: this.modalOrder,
            weiFillAmount: this.weiFillAmount,
            fillAmountControlled: this.fillAmountControlled,
            weiTotalEth: this.weiTotalEth,
            totalEthControlled: this.totalEthControlled,
            fillAmountValid: this.fillAmountValid,
            fillAmountInvalidReason: this.fillAmountInvalidReason,
            fillAmountInvalidField: this.fillAmountInvalidField,
            showTransactionModal: this.showTransactionModal,
            transactionHash: this.transactionHash,
            transactionModalIsError: this.transactionModalIsError,
            transactionModalErrorText: this.transactionModalErrorText,
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
            case ActionNames.EXECUTE_TRADE: {
                this.modal = true
                this.modalOrder = action.order
                this.weiFillAmount = action.weiFillAmount
                this.fillAmountControlled = action.fillAmountControlled
                this.weiTotalEth = action.weiTotalEth
                this.totalEthControlled = action.totalEthControlled
                this.fillAmountValid = action.fillAmountValid
                this.fillAmountInvalidReason = action.fillAmountInvalidReason
                this.fillAmountInvalidField = action.fillAmountInvalidField
                this.emitChange()
                break
            }
            case ActionNames.EXECUTE_TRADE_ABORTED: {
                this.modal = false
                this.emitChange()
                break
            }
            case ActionNames.FILL_AMOUNT_CHANGED: {
                this.weiFillAmount = action.weiFillAmount
                this.fillAmountControlled = action.fillAmountControlled
                this.weiTotalEth = action.weiTotalEth
                this.totalEthControlled = action.totalEthControlled
                this.fillAmountValid = action.fillAmountValid
                this.fillAmountInvalidReason = action.fillAmountInvalidReason
                this.fillAmountInvalidField = action.fillAmountInvalidField
                this.emitChange()
                break
            }
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
            case ActionNames.HIDE_TRANSACTION_MODAL: {
                this.showTransactionModal = false
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
                // this.showTransactionModal = true
                // this.transactionModalIsError = false
                // this.transactionHash = action.txHash
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
                // this.showTransactionModal = true
                // this.transactionModalIsError = true
                // this.transactionModalErrorText = action.errorMessage
                this.emitChange()
                break
            }            
        }
    }
}

const tradeStore = new TradeStore()
dispatcher.register(tradeStore.handleActions.bind(tradeStore))

export default tradeStore