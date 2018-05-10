import TransactionStatus from "../TransactionStatus"
import TokenListApi from "../apis/TokenListApi";
import OrderSide from "../OrderSide"

export function toDisplayableTrades(trades) {
    return trades.map(t => ({
            side: (t.side.toLowerCase() === OrderSide.SELL.toLowerCase()) ? "Sell" : "Buy",
            tokenName: TokenListApi.getTokenName(t.tokenAddr),
            market: TokenListApi.getTokenName(t.tokenAddr) + "/ETH",
            price: String(t.price),
            amount: String(t.amount),
            amountBase: String(t.amountBase),
            date: t.date,
            status: getStatusDescription(t.status),
            txHash: t.txHash
        })
    )
}

export function tradesToCsv(displayableTrades) {
    const header = "Market,Type,Price,Amount,Total (ETH),Date,Status,Transaction ID"
    const content = (displayableTrades || []).map(t => [t.market, t.side, t.price, t.amount, t.amountBase, t.date, t.status, t.txHash].join(","))

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