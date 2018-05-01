import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import TransactionStatus from "../TransactionStatus"

export function addMyTrade(trade) {
    dispatcher.dispatch({
        type: ActionNames.ADD_MY_TRADE,
        trade
    })
}

export function refreshMyTrade(txHash) {
    EtherDeltaWeb3.promiseTransactionReceipt(txHash)
        .then(receipt => {
            if (receipt) {
                const status = receipt.status ? TransactionStatus.COMPLETE : TransactionStatus.FAILED
                dispatcher.dispatch({
                    type: ActionNames.MY_TRADE_STATUS_UPDATE,
                    txHash,
                    status
                })
            }
        })
}

export function purge() {
    localStorage.removeItem("myTrades")
    dispatcher.dispatch({
        type: ActionNames.MY_TRADES_PURGED
    })
}