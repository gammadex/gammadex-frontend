import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function addMyTrade(trade) {
    dispatcher.dispatch({
        type: ActionNames.ADD_PENDING_TRADE,
        trade
    })
}

export function myTradeFailedUpdate(txHash) {
    dispatcher.dispatch({
        type: ActionNames.MY_TRADE_STATUS_UPDATE_FAILED,
        txHash
    })
}

export function myTradeCompletedUpdate(txHash) {
    dispatcher.dispatch({
        type: ActionNames.MY_TRADE_STATUS_UPDATE_COMPLETED,
        txHash
    })
}
