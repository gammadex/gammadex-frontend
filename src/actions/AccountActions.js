import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function accountTypeResolved(accountType) {
    dispatcher.dispatch({
        type: ActionNames.ACCOUNT_TYPE_RESOLVED,
        accountType
    })
}

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

export function balanceRetrievalFailed() {
    dispatcher.dispatch({
        type: ActionNames.BALANCE_RETRIEVAL_FAILED
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

export function depositWithdraw(isEth, isDeposit) {
    const depositWithdrawProps = {isEth, isDeposit}
    dispatcher.dispatch({
        type: ActionNames.DEPOSIT_WITHDRAW,
        depositWithdrawProps
    })
}

export function depositWithdrawCancel() {
    dispatcher.dispatch({
        type: ActionNames.DEPOSIT_WITHDRAW_CANCEL
    })
}

export function depositWithdrawAmountUpdated(amount) {
    dispatcher.dispatch({
        type: ActionNames.DEPOSIT_WITHDRAW_AMOUNT_UPDATED,
        amount
    })
}