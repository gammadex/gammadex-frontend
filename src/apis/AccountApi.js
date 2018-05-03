
import * as AccountActions from "../actions/AccountActions"
import TransferStore from "../stores/TransferStore"
import Timer from "../util/Timer"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import Config from "../Config"
import DepositType from "../DepositType"
import Routes from '../Routes'

export function refreshEthAndTokBalance(account, tokenAddress) {
    EtherDeltaWeb3.refreshEthAndTokBalance(account, tokenAddress)
        .then(balance => {
            AccountActions.balanceRetrieved(balance)
        })
        .catch(error => {
            AccountActions.balanceRetrievalFailed(error)
        })
}

export function refreshAccount(accountType, history) {
    EtherDeltaWeb3.refreshAccount()
        .then(addressNonce => {
            AccountActions.accountRetrieved(addressNonce, accountType)

            if (history) { // TODO - unfortunate that this has to be passed in here from a component
                history.push(Routes.Exchange)
            }
        })
        .catch(error => {
            AccountActions.accountRetrieveError(accountType, error)
        })
}

export function refreshNonce() {
    EtherDeltaWeb3.promiseRefreshNonce()
        .then(nonce => {
            AccountActions.nonceUpdated(nonce)
        })
}

export function depositEth(account, accountRetrieved, nonce, tokenAddress, amount, gasPriceWei) {
    if (accountRetrieved) {
        EtherDeltaWeb3.promiseDepositEther(account, nonce, amount, gasPriceWei)
            .once('transactionHash', hash => {
                AccountActions.nonceUpdated(nonce + 1)
                AccountActions.addPendingTransfer(DepositType.DEPOSIT, Config.getBaseAddress(), amount, hash)
            })
            .on('error', error => {
                console.log(`failed to deposit ether: ${error.message}`)
            })
            .then(receipt => {
                // will be fired once the receipt is mined
                refreshEthAndTokBalance(account, tokenAddress)
            })
    } else {
        // TODO dispatch account retrieval failed action
    }
}

export function withdrawEth(account, accountRetrieved, nonce, tokenAddress, amount, gasPriceWei) {
    if (accountRetrieved) {
        EtherDeltaWeb3.promiseWithdrawEther(account, nonce, amount, gasPriceWei)
            .once('transactionHash', hash => {
                AccountActions.nonceUpdated(nonce + 1)
                AccountActions.addPendingTransfer(DepositType.WITHDRAWAL, Config.getBaseAddress(), amount, hash)
            })
            .on('error', error => {
                console.log(`failed to withdraw ether: ${error.message}`)
            })
            .then(receipt => {
                refreshEthAndTokBalance(account, tokenAddress)
            })
    }
}

export function depositTok(account, accountRetrieved, nonce, tokenAddress, amount, gasPriceWei) {
    // depositing an ERC-20 token is two-step:
    // 1) call the token contract to approve the transfer to the destination address = ED
    // 2) initiate the transfer in the ED smart contract
    if (accountRetrieved) {
        EtherDeltaWeb3.promiseDepositToken(account, nonce, tokenAddress, amount, gasPriceWei)
            .once('transactionHash', hash => {
                AccountActions.nonceUpdated(nonce + 2) // as tok deposit is two transactions
                AccountActions.addPendingTransfer(DepositType.DEPOSIT, tokenAddress,
                    amount, hash)
            })
            .on('error', error => {
                console.log(`failed to deposit token: ${error.message}`)
            })
            .then(receipt => {
                refreshEthAndTokBalance(account, tokenAddress)
            })
    }
}

export function withdrawTok(account, accountRetrieved, nonce, tokenAddress, amount, gasPriceWei) {
    if (accountRetrieved) {
        EtherDeltaWeb3.promiseWithdrawToken(account, nonce, tokenAddress, amount, gasPriceWei)
            .once('transactionHash', hash => {
                AccountActions.nonceUpdated(nonce + 1)
                AccountActions.addPendingTransfer(DepositType.WITHDRAWAL, tokenAddress, amount, hash)
            })
            .on('error', error => {
                console.log(`failed to deposit token: ${error.message}`)
            })
            .then(receipt => {
                refreshEthAndTokBalance(account, tokenAddress)
            })
    }
}

export function refreshTransfers() {
    TransferStore.getPendingTransfers().forEach(transfer => {
        EtherDeltaWeb3.promiseTransactionReceipt(transfer.txHash)
            .then(receipt => {
                if (receipt) {
                    if (receipt.status) {
                        AccountActions.transferSucceeded(transfer.txHash)
                    } else {
                        AccountActions.transferFailed(transfer.txHash)
                    }
                }
            })
    })
}

export function startPendingTransferCheckLoop(ms = 3000) {
    refreshTransfers()
    Timer.start(refreshTransfers, ms)
}

export function stopPendingTransferCheckLoop() {
    Timer.stop(refreshTransfers)
}