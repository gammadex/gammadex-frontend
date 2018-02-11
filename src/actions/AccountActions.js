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