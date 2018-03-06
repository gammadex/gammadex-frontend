import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import TradeStatus from "../TradeStatus"

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
                const status = (EtherDeltaWeb3.hexToNumber(receipt.status) === 1) ?
                    TradeStatus.COMPLETE : TradeStatus.FAILED
                dispatcher.dispatch({
                    type: ActionNames.MY_TRADE_STATUS_UPDATE,
                    txHash,
                    status
                })
            }
        })
}