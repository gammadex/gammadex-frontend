import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import * as _ from "lodash"
import TransactionStatus from "../TransactionStatus"

class TransferStore extends EventEmitter {
    constructor() {
        super()
        this.completedTransfers = []
        this.pendingTransfers = []
        this.failedTransfers = []
        this.allTransfers = []
    }

    getPendingTransfers() {
        return this.pendingTransfers
    }

    getCompletedTransfers() {
        return this.completedTransfers
    }

    getFailedTransfers() {
        return this.failedTransfers
    }

    getAllTransfers() {
        return this.allTransfers
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.MESSAGE_RECEIVED_FUNDS: { // received when funds messages is sent from backend
                if (action.message) {
                    // TODO - handle TX ID clash using log index
                    const incomingTxIds = action.message.map(t => t.txHash)
                    this.pendingTransfers = this.pendingTransfers.filter(t => !incomingTxIds.includes(t.txHash))

                    const completedExcludingIncoming =  this.completedTransfers.filter(t => !incomingTxIds.includes(t.txHash))
                    this.completedTransfers = [...completedExcludingIncoming, ...action.message]
                }
                this.updateAllTransfers()
                this.emitChange()
                break
            }
            case ActionNames.ADD_PENDING_TRANSFER: {
                this.pendingTransfers = this.pendingTransfers.filter(t => t.txHash !== action.transfer.txHash)
                this.pendingTransfers.push(action.transfer)
                this.updateAllTransfers()
                this.emitChange()
                break
            }
            case ActionNames.TRANSFER_SUCCEEDED: {
                /*
                this.pendingTransfers = this.pendingTransfers.filter(t => t.txHash !== action.txHash)
                */
                this.updateAllTransfers()
                this.emitChange()
                break
            }
            case ActionNames.TRANSFER_FAILED: {
                /*
                const failed = this.pendingTransfers.filter(t => t.txHash === action.txHash)
                this.failedTransfers = this.failedTransfers.concat(failed)
                this.pendingTransfers = this.pendingTransfers.filter(t => t.txHash !== action.txHash)
                */
                this.updateAllTransfers()
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_MARKET: { // received on initial connect
                if (action.message && !_.isUndefined(action.message.myFunds)) {
                    this.completedTransfers = action.message.myFunds
                    this.updateAllTransfers()
                    this.emitChange()
                }
            }
        }
    }

    updateAllTransfers() {
        const completed = this.completedTransfers.map(t => Object.assign(t, {status: TransactionStatus.COMPLETE}))
        const pending = this.pendingTransfers.map(t => Object.assign(t, {status: TransactionStatus.PENDING}))
        const failed = this.failedTransfers.map(t => Object.assign(t, {status: TransactionStatus.FAILED}))

        this.allTransfers = _.reverse(_.sortBy([...completed, ...pending, ...failed], d => d.timestamp))
    }
}

const transferStore = new TransferStore()
dispatcher.register(transferStore.handleActions.bind(transferStore))

export default transferStore