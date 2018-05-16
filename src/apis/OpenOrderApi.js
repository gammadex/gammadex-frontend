import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import AccountStore from "../stores/AccountStore"
import * as AccountActions from "../actions/AccountActions"
import * as OpenOrderActions from "../actions/OpenOrderActions"
import Timer from "../util/Timer"
import OrderState from "../OrderState"
import OpenOrdersStore from "../stores/OpenOrdersStore"

export function cancelOpenOrder(openOrder) {
    const {account, nonce} = AccountStore.getAccountState()
    EtherDeltaWeb3.promiseCancelOrder(account, nonce, openOrder.order)
        .once('transactionHash', hash => {
            AccountActions.nonceUpdated(nonce + 1)
            OpenOrderActions.cancelOpenOrder(openOrder.hash, hash)
        })
        .on('error', error => {
            console.log(`failed to cancel open order: ${error.message}`)
        })
        .then(receipt => {
        })
}

export function refreshOpenOrder(openOrder) {
    EtherDeltaWeb3.promiseTransactionReceipt(openOrder.pendingCancelTx)
        .then(receipt => {
            if (receipt) {
                if (receipt.status) {
                    OpenOrderActions.cancelOpenOrderSucceeded(openOrder.hash)
                } else {
                    OpenOrderActions.cancelOpenOrderFailed(openOrder.hash)
                }
            }
        })
}

export function purge() {
    localStorage.removeItem("openOrders")
    OpenOrderActions.openOrdersPurged()
}

export function refreshOpenOrders() {
    OpenOrdersStore.getOpenOrders().filter(openOrder => openOrder.state === OrderState.PENDING_CANCEL).forEach(openOrder => {
        refreshOpenOrder(openOrder)
    })
}

export function startOpenOrdersRefreshLoop(ms = 10000) {
    Timer.start(refreshOpenOrders, ms)
}

export function stopOpenOrdersRefreshLoop() {
    Timer.stop(refreshOpenOrders)
}
