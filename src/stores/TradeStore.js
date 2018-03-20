import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

class TradeStore extends EventEmitter {
    constructor() {
        super()
        this.modal = false
        this.modalOrder = null,
        this.fillAmount = 0,
        this.fillAmountModal = 0,
        this.baseAmount = 0,
        this.baseAmountModal = 0,
        this.fillAmountValid = true,
        this.fillAmountInvalidReason = "",
        this.showTransactionModal = false,
        this.transactionHash = "",
        this.transactionModalIsError = false,
        this.transactionModalErrorText = ""
    }

    getTradeState() {
        return {
            modal: this.modal,
            modalOrder: this.modalOrder,
            fillAmount: this.fillAmount,
            fillAmountModal: this.fillAmountModal,
            baseAmount: this.baseAmount,
            baseAmountModal: this.baseAmountModal,
            fillAmountValid: this.fillAmountValid,
            fillAmountInvalidReason: this.fillAmountInvalidReason,
            showTransactionModal: this.showTransactionModal,
            transactionHash: this.transactionHash,
            transactionModalIsError: this.transactionModalIsError,
            transactionModalErrorText: this.transactionModalErrorText
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
                this.fillAmount = action.fillAmount
                this.fillAmountModal = action.fillAmountModal
                this.baseAmount = action.baseAmount,
                this.baseAmountModal = action.baseAmountModal,
                this.fillAmountValid = action.fillAmountValid
                this.fillAmountInvalidReason = action.fillAmountInvalidReason
                this.emitChange()
                break
            }
            case ActionNames.EXECUTE_TRADE_ABORTED: {
                this.modal = false
                this.emitChange()
                break
            }
            case ActionNames.FILL_AMOUNT_CHANGED: {
                this.fillAmount = action.fillAmount
                this.fillAmountModal = action.fillAmountModal
                this.baseAmount = action.baseAmount,
                this.baseAmountModal = action.baseAmountModal,
                this.fillAmountValid = action.fillAmountValid
                this.fillAmountInvalidReason = action.fillAmountInvalidReason
                this.emitChange()
                break
            }
            case ActionNames.HIDE_TRANSACTION_MODAL: {
                this.showTransactionModal = false
                this.emitChange()
                break
            }
            case ActionNames.SENT_TRANSACTION: {
                this.showTransactionModal = true
                this.transactionModalIsError = false
                this.transactionHash = action.txHash
                this.emitChange()
                break
            }
            case ActionNames.SEND_TRANSACTION_FAILED: {
                this.showTransactionModal = true
                this.transactionModalIsError = true
                this.transactionModalErrorText = action.errorMessage
                this.emitChange()
                break
            }            
        }
    }
}

const tradeStore = new TradeStore()
dispatcher.register(tradeStore.handleActions.bind(tradeStore))

export default tradeStore