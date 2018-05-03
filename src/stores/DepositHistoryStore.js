import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import TransactionStatus from "../TransactionStatus"
import * as _ from "lodash"

// TODO hydrate from gammadex backend
class DepositHistoryStore extends EventEmitter {
    constructor() {
        super()
        this.completedTransfers = []
        this.depositHistory = []
    }

    getDepositHistoryState() {
        return {
            depositHistory: this.depositHistory
        }
    }

    getCompletedTransfers() {
        return this.completedTransfers
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.ADD_DEPOSIT_OR_WITHDRAWAL: {
                this.depositHistory.push(action.depositOrWithdrawal)
                this.emitChange()
                break
            }
            case ActionNames.DEPOSIT_OR_WITHDRAWAL_SUCCEEDED: {
                this.depositHistory.filter(d => d.txHash === action.txHash).forEach(d => {
                    d.status = TransactionStatus.COMPLETE
                })
                this.emitChange()
                break
            }
            case ActionNames.DEPOSIT_OR_WITHDRAWAL_FAILED: {
                this.depositHistory.filter(d => d.txHash === action.txHash).forEach(d => {
                    d.status = TransactionStatus.FAILED
                })
                this.emitChange()
                break
            }
            case ActionNames.DEPOSIT_HISTORY_PURGED: {
                this.depositHistory = []
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_MARKET: {
                if (action.message && !_.isUndefined(action.message.myFunds)) {
                    console.log("MESSAGE_RECEIVED_MARKET in DepositHistoryStore")
                    this.completedTransfers = action.message.myFunds.slice()
                    this.emitChange()
                }
            }
        }
    }
}

const depositHistoryStore = new DepositHistoryStore()
dispatcher.register(depositHistoryStore.handleActions.bind(depositHistoryStore))

export default depositHistoryStore