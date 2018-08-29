import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function sentGetTokenBalances() {
    dispatcher.dispatch({
        type: ActionNames.MESSAGE_REQUESTED_TOKEN_BALANCES,
    })
}

export function tokenBalancesRetrieved(balances) {
    dispatcher.dispatch({
        type: ActionNames.MESSAGE_RECEIVED_TOKEN_BALANCES,
        balances,
    })
}

export function tokenBalancesFailed() {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_BALANCES_RETRIEVAL_FAILED,
    })
}

export function tokenBalancesSort(sortColumn, sortOrder) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_BALANCE_SORT,
        sortColumn,
        sortOrder
    })
}

export function filterLowValueBalances(filterOrNot) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_BALANCE_FILTER_LOW_VALUE,
        filterLowValue: filterOrNot
    })
}
