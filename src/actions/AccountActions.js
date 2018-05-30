import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function retrievingAccount() {
    dispatcher.dispatch({
        type: ActionNames.RETRIEVING_ACCOUNT,
    })
}

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

export function retrievingBalance() {
    dispatcher.dispatch({
        type: ActionNames.RETRIEVING_BALANCE,
    })
}

export function balanceRetrieved(balance, notify, tokenAddress) {
    dispatcher.dispatch({
        type: ActionNames.BALANCE_RETRIEVED,
        balance,
        notify,
        tokenAddress
    })
}

export function balanceRetrievalFailed(error, notify) {
    dispatcher.dispatch({
        type: ActionNames.BALANCE_RETRIEVAL_FAILED,
        error,
        notify
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

export function toggleAccountPopover(accountPopoverOpen) {
    dispatcher.dispatch({
        type: ActionNames.TOGGLE_ACCOUNT_POPOVER,
        accountPopoverOpen
    })
}
