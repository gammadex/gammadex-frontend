import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

// TODO hydrate from gammadex backend
class MyTradesStore extends EventEmitter {
    constructor() {
        super()
        if(localStorage.myTrades) {
            this.trades = JSON.parse(localStorage.myTrades)
        } else {
            this.trades = []
        }
    }

    getMyTradesState() {
        return {
            trades: this.trades
        }
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.ADD_MY_TRADE: {
                this.trades.push(action.trade)
                this.emitChange()
                break
            }
            case ActionNames.MY_TRADE_STATUS_UPDATE: {
                this.trades.filter(trade => trade.txHash === action.txHash).forEach(trade => {
                    trade.status = action.status
                })
                this.emitChange()
                break
            }
            case ActionNames.MY_TRADES_PURGED: {
                this.trades = []
                this.emitChange()
                break
            }
        }
        localStorage.myTrades = JSON.stringify(this.trades)
    }
}

const myTradesStore = new MyTradesStore()
dispatcher.register(myTradesStore.handleActions.bind(myTradesStore))

export default myTradesStore