import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function executeTrade(order) {
    dispatcher.dispatch({
        type: ActionNames.EXECUTE_TRADE,
        order
    })
}

export function executeTradeAborted() {
    dispatcher.dispatch({
        type: ActionNames.EXECUTE_TRADE_ABORTED
    })
}