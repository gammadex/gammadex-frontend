import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function addOpenOrder(openOrder) {
    dispatcher.dispatch({
        type: ActionNames.ADD_OPEN_ORDER,
        openOrder
    })
}

export function cancelOpenOrder(orderHash, txHash) {
    dispatcher.dispatch({
        type: ActionNames.CANCEL_OPEN_ORDER,
        orderHash,
        txHash,
    })
}

export function cancelOpenOrderSucceeded(orderHash) {
    dispatcher.dispatch({
        type: ActionNames.CANCEL_OPEN_ORDER_SUCCEEDED,
        orderHash
    })
}

export function cancelOpenOrderFailed(orderHash) {
    dispatcher.dispatch({
        type: ActionNames.CANCEL_OPEN_ORDER_FAILED,
        orderHash
    })
}

export function openOrdersPurged() {
    dispatcher.dispatch({
        type: ActionNames.OPEN_ORDERS_PURGED
    })
}