import lifecycleStore from "./stores/LifecycleStore"
import OrderSide from "./OrderSide"
import * as GlobalMessageFormatters from "./util/GlobalMessageFormatters"
import * as GlobalMessageActions from "./actions/GlobalMessageActions"
import TokenRepository from "./util/TokenRepository"

class OrderFillNotifier {
    constructor() {
        this.seenTxIds = []
        this.notifyMaker = this.notifyMaker.bind(this)
    }

    notifyMaker(trades, account) {
        if(account != null) {
            const makerTrades = trades.filter(t => {
                return new Date(t.date).isAfter(lifecycleStore.getStartupDate()) && 
                    !this.seenTxIds.includes(t.txHash) && (
                    (t.side === OrderSide.BUY && t.seller.toLowerCase() === account.toLowerCase()) ||
                    (t.side === OrderSide.SELL && t.buyer.toLowerCase() === account.toLowerCase())
                )
            })
            makerTrades.forEach(t => {
                this.seenTxIds.push(t.txHash)
                GlobalMessageActions.sendGlobalMessage(
                    GlobalMessageFormatters.getOrderFilled(
                        t.side === OrderSide.BUY ? 'SOLD' : 'BOUGHT',
                        t.amount,
                        TokenRepository.getTokenName(t.tokenAddr)), 'success')
            })
        }
    }
}

export default new OrderFillNotifier()