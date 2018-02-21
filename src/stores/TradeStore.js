import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

class TradeStore extends EventEmitter {
    constructor() {
        super()
        this.modal = false
        this.modalOrder = null
    }

    getTradeState() {
        return {
            modal: this.modal,
            modalOrder: this.modalOrder
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
                this.emitChange()
                break
            }
            case ActionNames.EXECUTE_TRADE_ABORTED: {
                this.modal = false
                this.emitChange()
                break
            }
        }
    }
}

const tradeStore = new TradeStore()
dispatcher.register(tradeStore.handleActions.bind(tradeStore))

export default tradeStore