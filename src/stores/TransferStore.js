import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import * as _ from "lodash"
import TransactionStatus from "../TransactionStatus"
import AccountStore from "./AccountStore"
import * as TransfersDao from "../util/TransfersDao"

class TransferStore extends EventEmitter {
    constructor() {
        super()
        this.accountAddress = AccountStore.getAccount() // TODO - ouch, store depends on a store. Not great. Maybe redux can help here
        this.clearTransfers()
        this.loadFromLocalStorage()
        this.updateAllTransfers()
        this.refreshInProgress = false
    }

    getAllTransfers() {
        return this.allTransfers
    }

    isRefreshInProgress() {
        return this.refreshInProgress
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.MESSAGE_REQUESTED_MARKET: {
                this.refreshInProgress = true
            }
            case ActionNames.MESSAGE_RECEIVED_FUNDS: { // received when funds messages is sent from backend
                if (action.funds) {
                    const incomingTxIds = action.funds.map(t => t.txHash)
                    this.pendingTransfers = this.pendingTransfers.filter(t => !incomingTxIds.includes(t.txHash))

                    const completedExcludingIncoming = this.completedTransfers.filter(t => !incomingTxIds.includes(t.txHash))
                    this.completedTransfers = [...completedExcludingIncoming, ...action.funds]
                }
                this.updateAllTransfers()
                this.persistToLocalStorage()
                this.emitChange()
                break
            }
            case ActionNames.ADD_PENDING_TRANSFER: {
                this.pendingTransfers = this.pendingTransfers.filter(t => t.txHash !== action.transfer.txHash)
                this.pendingTransfers.push(action.transfer)
                this.updateAllTransfers()
                this.persistToLocalStorage()
                this.emitChange()
                break
            }
            case ActionNames.TRANSFER_SUCCEEDED: {
                const succeeded = this.pendingTransfers.filter(t => t.txHash === action.txHash)
                this.completedTransfers = this.completedTransfers.concat(succeeded)
                this.pendingTransfers = this.pendingTransfers.filter(t => t.txHash !== action.txHash)
                this.updateAllTransfers()
                this.persistToLocalStorage()
                this.emitChange()
                break
            }
            case ActionNames.TRANSFER_FAILED: {
                const failed = this.pendingTransfers.filter(t => t.txHash === action.txHash)
                this.failedTransfers = this.failedTransfers.concat(failed)
                this.pendingTransfers = this.pendingTransfers.filter(t => t.txHash !== action.txHash)
                this.updateAllTransfers()
                this.persistToLocalStorage()
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_MARKET: { // received on initial connect
                if (action.message && !_.isUndefined(action.message.myFunds)) {
                    this.refreshInProgress = false
                    this.completedTransfers = action.message.myFunds
                    this.updateAllTransfers()
                    this.emitChange()
                }
                break
            }
            case ActionNames.ACCOUNT_RETRIEVED: {
                this.accountAddress = action.addressNonce.address
                this.clearTransfers()
                this.loadFromLocalStorage()
                this.updateAllTransfers()
                this.emitChange()
                break
            }
            case ActionNames.WALLET_LOGOUT: {
                this.accountAddress = null
                this.clearTransfers()
                this.emitChange()
                break
            }
        }
    }

    loadFromLocalStorage() {
        this.pendingTransfers = TransfersDao.loadPendingTransfers(this.accountAddress)
        this.failedTransfers = TransfersDao.loadFailedTransfers(this.accountAddress)
    }

    persistToLocalStorage() {
        TransfersDao.savePendingTransfers(this.accountAddress, this.pendingTransfers)
        TransfersDao.saveFailedTransfers(this.accountAddress, this.failedTransfers)
    }

    clearTransfers() {
        this.completedTransfers = []
        this.pendingTransfers = []
        this.failedTransfers = []
        this.updateAllTransfers()
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