import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function accountRetrieved(addressNonce, accountType) {
    dispatcher.dispatch({
        type: ActionNames.ACCOUNT_RETRIEVED,
        addressNonce,
        selectedAccountType: accountType
    })
}

export function accountRetrieveError(accountType, error) {
    dispatcher.dispatch({
        type: ActionNames.ACCOUNT_REFRESH_ERROR,
        selectedAccountType: accountType,
        error
    })
}

export function balanceRetrieved(balance) {
    dispatcher.dispatch({
        type: ActionNames.BALANCE_RETRIEVED,
        balance
    })
}

export function balanceRetrievalFailed(error) {
    dispatcher.dispatch({
        type: ActionNames.BALANCE_RETRIEVAL_FAILED,
        error
    })
}

export function addPendingTransfer(type, tokenAddress, amount, hash) {
    const transfer = {
        date: (new Date()).toISOString(),
        kind: type,
        tokenAddr: tokenAddress,
        amount: amount,
        txHash: hash,
    }

    dispatcher.dispatch({
        type: ActionNames.ADD_PENDING_TRANSFER,
        transfer
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

export function nonceUpdated(nonce) {
    dispatcher.dispatch({
        type: ActionNames.NONCE_UPDATED,
        nonce
    })
}

export function transferSucceeded(txHash) {
    dispatcher.dispatch({
        type: ActionNames.TRANSFER_SUCCEEDED,
        txHash: txHash
    })
}

export function transferFailed(txHash) {
    dispatcher.dispatch({
        type: ActionNames.TRANSFER_FAILED,
        txHash: txHash
    })
}