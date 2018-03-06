import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"

// TODO all these .catch(error => )'s should be actions
export function refreshAccount(accountType) {
    EtherDeltaWeb3.refreshAccount()
        .then(addressNonce => {
            dispatcher.dispatch({
                type: ActionNames.ACCOUNT_RETRIEVED,
                addressNonce,
                selectedAccountType: accountType
            })
        })
        .catch(error => {
            dispatcher.dispatch({
                type: ActionNames.ACCOUNT_REFRESH_ERROR,
                selectedAccountType: accountType,
                error
            })
        })
}

export function refreshNonce() {
    EtherDeltaWeb3.promiseRefreshNonce()
        .then(nonce => {
            nonceUpdated(nonce)
        })
}

export function refreshEthAndTokBalance(account, tokenAddress) {
    EtherDeltaWeb3.refreshEthAndTokBalance(account, tokenAddress)
        .then(balance => {
            dispatcher.dispatch({
                type: ActionNames.BALANCE_RETRIEVED,
                balance
            })
        })
        .catch(error => {
            dispatcher.dispatch({
                type: ActionNames.BALANCE_RETRIEVAL_FAILED,
                error
            })
        })
}

export function depositEth(account, accountRetrieved, nonce, tokenAddress, amount) {
    if (accountRetrieved) {
        EtherDeltaWeb3.promiseDepositEther(account, nonce, amount)
            .once('transactionHash', hash => {
                nonceUpdated(nonce + 1)
                ethTransaction(hash)
            })
            .on('error', error => { console.log(`failed to deposit ether: ${error.message}`) })
            .then(receipt => {
                // will be fired once the receipt is mined
                refreshEthAndTokBalance(account, tokenAddress)
            })
    } else {
        // TODO dispatch account retrieval failed action
    }
}

export function withdrawEth(account, accountRetrieved, nonce, tokenAddress, amount) {
    if (accountRetrieved) {
        EtherDeltaWeb3.promiseWithdrawEther(account, nonce, amount)
            .once('transactionHash', hash => {
                nonceUpdated(nonce + 1)
                ethTransaction(hash)
            })
            .on('error', error => { console.log(`failed to withdraw ether: ${error.message}`) })
            .then(receipt => {
                refreshEthAndTokBalance(account, tokenAddress)
            })
    }
}

export function depositTok(account, accountRetrieved, nonce, tokenAddress, amount) {
    // depositing an ERC-20 token is two-step:
    // 1) call the token contract to approve the transfer to the destination address = ED
    // 2) initiate the transfer in the ED smart contract
    if (accountRetrieved) {
        EtherDeltaWeb3.promiseDepositToken(account, nonce, tokenAddress, amount)
            .once('transactionHash', hash => {
                nonceUpdated(nonce + 2) // as tok deposit is two transactions
                tokTransaction(hash)
            })
            .on('error', error => { console.log(`failed to deposit token: ${error.message}`) })
            .then(receipt => {
                refreshEthAndTokBalance(account, tokenAddress)
            })
    }
}

export function withdrawTok(account, accountRetrieved, nonce, tokenAddress, amount) {
    if (accountRetrieved) {
        EtherDeltaWeb3.promiseWithdrawToken(account, nonce, tokenAddress, amount)
            .once('transactionHash', hash => {
                nonceUpdated(nonce + 1)
                tokTransaction(hash)
            })
            .on('error', error => { console.log(`failed to deposit token: ${error.message}`) })
            .then(receipt => {
                refreshEthAndTokBalance(this.state.account, tokenAddress)
            })
    }
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
    const depositWithdrawProps = { isEth, isDeposit }
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