import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import * as _ from "lodash"
import TransactionStatus from "../TransactionStatus"
import AccountStore from "./AccountStore"
import * as TradesDao from "../util/TradesDao"

class MyTradesStore extends EventEmitter {
    constructor() {
        super()
        this.accountAddress = AccountStore.getAccount() // TODO - ouch, store depends on a store. Not great. Maybe redux can help here
        this.clearTrades()
        this.loadFromLocalStorage()
        this.updateAllTrades()
    }

    getAllTrades(tokenAddress) {
        if (tokenAddress) {
            return this.allTrades.filter(trade => trade.tokenAddr === tokenAddress)
        }

        return this.allTrades
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.MESSAGE_RECEIVED_TRADES: { // received when trades messages is sent from backend
                if (action.trades) {
                    const incomingTxIds = action.trades.map(t => t.txHash)
                    this.pendingTrades = this.pendingTrades.filter(t => !incomingTxIds.includes(t.txHash))

                    const completedExcludingIncoming = this.completedTrades.filter(t => !incomingTxIds.includes(t.txHash))
                    this.completedTrades = [...completedExcludingIncoming, ...action.trades]
                }
                this.updateAllTrades()
                this.persistToLocalStorage()
                this.emitChange()
                break
            }
            case ActionNames.ADD_PENDING_TRADE: {
                this.pendingTrades = this.pendingTrades.filter(t => t.txHash !== action.trade.txHash)
                this.pendingTrades.push(action.trade)
                this.updateAllTrades()
                this.persistToLocalStorage()
                this.emitChange()
                break
            }
            case ActionNames.MY_TRADE_STATUS_UPDATE_COMPLETED: {
                const succeeded = this.pendingTrades.filter(t => t.txHash === action.txHash)
                this.completedTrades = this.completedTrades.concat(succeeded)
                this.pendingTrades = this.pendingTrades.filter(t => t.txHash !== action.txHash)
                this.updateAllTrades()
                this.persistToLocalStorage()
                this.emitChange()
                break
            }
            case ActionNames.MY_TRADE_STATUS_UPDATE_FAILED: {
                const failed = this.pendingTrades.filter(t => t.txHash === action.txHash)
                this.failedTrades = this.failedTrades.concat(failed)
                this.pendingTrades = this.pendingTrades.filter(t => t.txHash !== action.txHash)
                this.updateAllTrades()
                this.persistToLocalStorage()
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_MARKET: { // received on initial connect
                if (action.message && !_.isUndefined(action.message.myTrades)) {
                    this.completedTrades = action.message.myTrades
                    this.updateAllTrades()
                    this.emitChange()
                }
                break
            }
            case ActionNames.ACCOUNT_RETRIEVED: {
                this.accountAddress = action.addressNonce.address
                this.clearTrades()
                this.loadFromLocalStorage()
                this.updateAllTrades()
                this.emitChange()
                break
            }
            case ActionNames.WALLET_LOGOUT: {
                this.accountAddress = null
                this.clearTrades()
                this.emitChange()
                break
            }
        }
    }

    loadFromLocalStorage() {
        this.pendingTrades = TradesDao.loadPendingTrades(this.accountAddress)
        this.failedTrades = TradesDao.loadFailedTrades(this.accountAddress)
    }

    persistToLocalStorage() {
        TradesDao.savePendingTrades(this.accountAddress, this.pendingTrades)
        TradesDao.saveFailedTrades(this.accountAddress, this.failedTrades)
    }

    clearTrades() {
        this.completedTrades = []
        this.pendingTrades = []
        this.failedTrades = []
        this.updateAllTrades()
    }

    updateAllTrades() {
        const completed = this.completedTrades.map(t => Object.assign(t, {status: TransactionStatus.COMPLETE}))
        const pending = this.pendingTrades.map(t => Object.assign(t, {status: TransactionStatus.PENDING}))
        const failed = this.failedTrades.map(t => Object.assign(t, {status: TransactionStatus.FAILED}))

        this.allTrades = _.reverse(_.sortBy([...completed, ...pending, ...failed], d => d.timestamp))
    }
}

const myTradesStore = new MyTradesStore()
dispatcher.register(myTradesStore.handleActions.bind(myTradesStore))

export default myTradesStore