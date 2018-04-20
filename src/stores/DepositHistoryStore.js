import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import TransactionStatus from "../TransactionStatus"

// TODO hydrate from gammadex backend
class DepositHistoryStore extends EventEmitter {
    constructor() {
        super()
        if(localStorage.depositHistory) {
            this.depositHistory = JSON.parse(localStorage.depositHistory)
        } else {
            this.depositHistory = []
        }
    }

    getDepositHistoryState() {
        return {
            depositHistory: this.depositHistory
        }
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
        }
        localStorage.depositHistory = JSON.stringify(this.depositHistory)
    }
}

const depositHistoryStore = new DepositHistoryStore()
dispatcher.register(depositHistoryStore.handleActions.bind(depositHistoryStore))

export default depositHistoryStore