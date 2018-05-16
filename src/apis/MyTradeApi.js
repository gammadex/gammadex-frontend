import MyTradesStore from '../stores/MyTradesStore'
import * as MyTradeActions from '../actions/MyTradeActions'
import TransactionStatus from "../TransactionStatus"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import Timer from "../util/Timer"

export function refreshMyTrades() {
    MyTradesStore.getAllTrades()
        .filter(trade => trade.status === TransactionStatus.PENDING)
        .map(trade => trade.txHash)
        .forEach(txHash => {
            EtherDeltaWeb3.promiseTransactionReceipt(txHash)
                .then(receipt => {
                    if (receipt) {
                        if (receipt.status) {
                            MyTradeActions.myTradeCompletedUpdate(txHash)
                        } else {
                            MyTradeActions.myTradeFailedUpdate(txHash)
                        }
                    }
                })
        })
}

export function startPendingTradesCheckLoop(ms = 10000) {
    Timer.start(refreshMyTrades, ms)
}

export function stopPendingTradesCheckLoop() {
    Timer.stop(refreshMyTrades)
}