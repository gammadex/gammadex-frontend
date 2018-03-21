import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import Config from "../Config"
import DepositType from "../DepositType"
import TransactionStatus from "../TransactionStatus"
import Routes from '../Routes'

// TODO all these .catch(error => )'s should be actions
export function refreshAccount(accountType, history) {
    EtherDeltaWeb3.refreshAccount()
        .then(addressNonce => {
            dispatcher.dispatch({
                type: ActionNames.ACCOUNT_RETRIEVED,
                addressNonce,
                selectedAccountType: accountType
            })

            // TODO - can you think of a better place or this? In here for now
            if (history) {
                history.push(Routes.Exchange)
            }
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

export function addDepositOrWithdrawal(depositType, tokenAddress, amount, hash) {
    const depositOrWithdrawal = {
        environment: Config.getReactEnv(),
        timestamp: (new Date()).toISOString(),
        depositType: depositType,
        tokenAddress: tokenAddress,
        amount: amount,
        txHash: hash,
        status: TransactionStatus.PENDING
    }
    dispatcher.dispatch({
        type: ActionNames.ADD_DEPOSIT_OR_WITHDRAWAL,
        depositOrWithdrawal
    })
}

export function depositEth(account, accountRetrieved, nonce, tokenAddress, amount) {
    if (accountRetrieved) {
        EtherDeltaWeb3.promiseDepositEther(account, nonce, amount)
            .once('transactionHash', hash => {
                nonceUpdated(nonce + 1)
                addDepositOrWithdrawal(DepositType.DEPOSIT, Config.getBaseAddress(), amount, hash)
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
                addDepositOrWithdrawal(DepositType.WITHDRAWAL, Config.getBaseAddress(), amount, hash)
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
                addDepositOrWithdrawal(DepositType.DEPOSIT, tokenAddress,
                    amount, hash)
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
                addDepositOrWithdrawal(DepositType.WITHDRAWAL, tokenAddress,
                    amount, hash)
            })
            .on('error', error => { console.log(`failed to deposit token: ${error.message}`) })
            .then(receipt => {
                refreshEthAndTokBalance(account, tokenAddress)
            })
    }
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

export function refreshDeposit(deposit) {
    EtherDeltaWeb3.promiseTransactionReceipt(deposit.txHash)
        .then(receipt => {
            if (receipt) {
                if (EtherDeltaWeb3.hexToNumber(receipt.status) === 1) {
                    dispatcher.dispatch({
                        type: ActionNames.DEPOSIT_OR_WITHDRAWAL_SUCCEEDED,
                        txHash: deposit.txHash
                    })
                } else {
                    dispatcher.dispatch({
                        type: ActionNames.DEPOSIT_OR_WITHDRAWAL_FAILED,
                        txHash: deposit.txHash
                    })
                }
            }
        })
}

export function purgeDepositHistory() {
    localStorage.removeItem("depositHistory")
    dispatcher.dispatch({
        type: ActionNames.DEPOSIT_HISTORY_PURGED
    })
}