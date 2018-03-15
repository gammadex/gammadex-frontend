import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import TradeStatus from "../TradeStatus"
import AccountStore from "../stores/AccountStore"
import * as AccountActions from "../actions/AccountActions"

export function addOpenOrder(openOrder) {
    dispatcher.dispatch({
        type: ActionNames.ADD_OPEN_ORDER,
        openOrder
    })
}

export function cancelOpenOrder(openOrder) {
    const { account, nonce } = AccountStore.getAccountState()
    EtherDeltaWeb3.promiseCancelOrder(account, nonce, openOrder.order)
        .once('transactionHash', hash => {
            AccountActions.nonceUpdated(nonce + 1)
            dispatcher.dispatch({
                type: ActionNames.CANCEL_OPEN_ORDER,
                orderHash: openOrder.hash,
                txHash: hash
            })
        })
        .on('error', error => { console.log(`failed to cancel open order: ${error.message}`) })
        .then(receipt => {})
}

export function refreshOpenOrder(openOrder) {
    EtherDeltaWeb3.promiseTransactionReceipt(openOrder.pendingCancelTx)
        .then(receipt => {
            if (receipt) {
                if(EtherDeltaWeb3.hexToNumber(receipt.status) === 1) {
                    dispatcher.dispatch({
                        type: ActionNames.CANCEL_OPEN_ORDER_SUCCEEDED,
                        orderHash: openOrder.hash
                    })
                } else {
                    dispatcher.dispatch({
                        type: ActionNames.CANCEL_OPEN_ORDER_FAILED,
                        orderHash: openOrder.hash
                    })
                }
            }
        })
}

export function purge() {
    localStorage.removeItem("openOrders")
    dispatcher.dispatch({
        type: ActionNames.OPEN_ORDERS_PURGED
    })
}