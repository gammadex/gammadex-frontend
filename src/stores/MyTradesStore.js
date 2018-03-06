import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

// this should be hydrated from the server side
class MyTradesStore extends EventEmitter {
    constructor() {
        super()
        this.trades = []
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
        }
    }
}

const myTradesStore = new MyTradesStore()
dispatcher.register(myTradesStore.handleActions.bind(myTradesStore))

export default myTradesStore