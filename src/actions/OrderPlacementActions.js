import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function sellOrderTypeChanged(orderType, price, amount, total) {
    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_TYPE_CHANGED,
        orderType,
        price,
        amount,
        total
    })
}

export function sellOrderChanged(price, amount, total) {
    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_CHANGED,
        price,
        amount,
        total
    })
}

export function buyOrderTypeChanged(orderType, price, amount, total) {
    dispatcher.dispatch({
        type: ActionNames.BUY_ORDER_TYPE_CHANGED,
        orderType,
        price,
        amount,
        total
    })
}

export function buyOrderChanged(price, amount, total) {
    dispatcher.dispatch({
        type: ActionNames.BUY_ORDER_CHANGED,
        price,
        amount,
        total
    })
}
