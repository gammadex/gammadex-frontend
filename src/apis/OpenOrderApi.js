import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import AccountStore from "../stores/AccountStore"
import * as AccountActions from "../actions/AccountActions"
import * as OpenOrderActions from "../actions/OpenOrderActions"
import Timer from "../util/Timer"
import OrderState from "../OrderState"
import OpenOrdersStore from "../stores/OpenOrdersStore"
import TokenListApi from "./TokenListApi"
import * as GlobalMessageFormatters from "../util/GlobalMessageFormatters"
import * as GlobalMessageActions from "../actions/GlobalMessageActions"

export function cancelOpenOrder(openOrder, gasPriceWei) {
    const {account, nonce} = AccountStore.getAccountState()
    const tokenName = TokenListApi.getTokenName(openOrder.tokenAddress)

    EtherDeltaWeb3.promiseCancelOrder(account, nonce, openOrder.order, gasPriceWei)
        .once('transactionHash', hash => {
            AccountActions.nonceUpdated(nonce + 1)
            OpenOrderActions.cancelOpenOrder(openOrder.hash, hash)
            GlobalMessageActions.sendGlobalMessage(
                GlobalMessageFormatters.getCancelInitiated(tokenName, hash))
        })
        .on('error', error => {
            GlobalMessageActions.sendGlobalMessage(
                GlobalMessageFormatters.getCancelFailed(tokenName, error), "danger")
        })
        .then(receipt => {
            GlobalMessageActions.sendGlobalMessage(GlobalMessageFormatters.getCancelComplete(tokenName), "success")
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
