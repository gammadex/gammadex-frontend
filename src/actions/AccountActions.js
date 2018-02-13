import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function accountRetrieved(account) {
    dispatcher.dispatch({
        type: ActionNames.ACCOUNT_RETRIEVED,
        account
    })
}

export function balanceRetrieved(balance) {
    dispatcher.dispatch({
        type: ActionNames.BALANCE_RETRIEVED,
        balance
    })
}

export function ethTransaction(tx) {
    dispatcher.dispatch({
        type: ActionNames.ETH_TRANSACTION,
        tx
    })
}

export function tokTransaction(tx) {
    dispatcher.dispatch({
        type: ActionNames.TOK_TRANSACTION,
        tx
    })
}