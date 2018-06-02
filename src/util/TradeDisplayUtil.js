import TransactionStatus from "../TransactionStatus"
import TokenListApi from "../apis/TokenListApi";
import OrderSide from "../OrderSide"

export function toDisplayableTrades(trades, account) {
    return trades.map(t => {
        const { side, role } = accountSide(t, account)
        return {
            side: side,
            role: role,
            takerSide: (t.side.toLowerCase() === OrderSide.SELL.toLowerCase()) ? "Sell" : "Buy",
            tokenName: TokenListApi.getTokenName(t.tokenAddr),
            market: TokenListApi.getTokenName(t.tokenAddr) + "/ETH",
            price: String(t.price),
            amount: String(t.amount),
            amountBase: String(t.amountBase),
            date: t.date,
            status: getStatusDescription(t.status),
            txHash: t.txHash
        }
    })
}

// trade.side is always from the perspective of the taker. The user might be the taker or maker (or both!) for a particular trade
export function accountSide(trade, account) {
    if (!trade.buyer || !trade.seller) {
        return {}
    }
    
    if(trade.buyer.toLowerCase() === trade.seller.toLowerCase()) {
        return { side: "Both", role: "Both" }
    }

    if (trade.side.toLowerCase() === OrderSide.BUY.toLowerCase()) {
        return trade.buyer.toLowerCase() === account.toLowerCase() ? { side: "Buy", role: "Taker" }
            : { side: "Sell", role: "Maker" }
    } else {
        return trade.buyer.toLowerCase() === account.toLowerCase() ? { side: "Buy", role: "Maker" }
            : { side: "Sell", role: "Taker" }
    }
}

export function tradesToCsv(displayableTrades) {
    const header = "Market,Role,Type,Price,Amount,Total (ETH),Date,Status,Transaction ID"
    const content = (displayableTrades || []).map(t => [t.market, t.role, t.side, t.price, t.amount, t.amountBase, t.date, t.status, t.txHash].join(","))

    return [header, ...content].join("\r\n")
}

function getStatusDescription(status) {
    if (status === TransactionStatus.COMPLETE) {
        return "Complete"
    } else if (status === TransactionStatus.FAILED) {
        return "Failed"
    } else {
        return "Pending"
    }
}