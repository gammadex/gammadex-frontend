import TransactionStatus from "../TransactionStatus"
import TokenRepository from "./TokenRepository"
import OrderSide from "../OrderSide"
import TradeRole from "../TradeRole"
import {baseWeiToEth, safeBigNumber} from "../EtherConversion"
import Config from "../Config"

export function toDisplayableTrades(trades, account) {
    return trades.map(t => {
        const {side, role} = accountSide(t, account)
        const tokenName = TokenRepository.getTokenIdentifier(t.tokenAddr)
        const {takerGasFee, takerExchangeFee} = calculateFees(t)
        const takerExchangeFeeUnit = t.side.toLowerCase() === OrderSide.SELL.toLowerCase() ? tokenName : 'ETH'
        return {
            side: side,
            role: role,
            takerSide: (t.side.toLowerCase() === OrderSide.SELL.toLowerCase()) ? "Sell" : "Buy",
            tokenName: tokenName,
            tokenAddress: t.tokenAddr,
            price: String(t.price),
            amount: String(t.amount),
            amountBase: String(t.amountBase),
            date: t.date,
            status: getStatusDescription(t.status),
            txHash: t.txHash,
            takerExchangeFee: takerExchangeFee,
            exchangeFee: role === TradeRole.TAKER ? takerExchangeFee : null,
            takerExchangeFeeUnit: takerExchangeFeeUnit,
            takerGasFee: takerGasFee,
            gasFee: role === TradeRole.TAKER ? takerGasFee : null
        }
    })
}

function calculateFees(t) {
    if (TokenRepository.tokenExists(t.tokenAddr)) {
        const takerGasFee = String(baseWeiToEth(t.gasPrice).times(safeBigNumber(t.gasUsed)))
        const takerExchangeFee = String(safeBigNumber(t.side.toLowerCase() === OrderSide.SELL.toLowerCase() ? t.amount : t.amountBase).times(safeBigNumber(Config.getExchangeFeePercent())))

        return {takerGasFee, takerExchangeFee}
    } else {
        return {takerGasFee: '', takerExchangeFee: ''}
    }
}

// trade.side is always from the perspective of the taker. The user might be the taker or maker (or both!) for a particular trade
export function accountSide(trade, account) {
    if (!trade.buyer || !trade.seller || !account) {
        return {}
    }

    if (trade.buyer.toLowerCase() === trade.seller.toLowerCase()) {
        return {side: "Both", role: "Both"}
    }

    if (trade.side.toLowerCase() === OrderSide.BUY.toLowerCase()) {
        return trade.buyer.toLowerCase() === account.toLowerCase() ? {side: "Buy", role: TradeRole.TAKER}
            : {side: "Sell", role: TradeRole.MAKER}
    } else {
        return trade.buyer.toLowerCase() === account.toLowerCase() ? {side: "Buy", role: TradeRole.MAKER}
            : {side: "Sell", role: TradeRole.TAKER}
    }
}

export function tradesToCsv(displayableTrades) {
    const header = "Market,Role,Type,Price,Amount,Total (ETH),Exchange Fee,Exchange Fee Unit,Gas Fee (ETH),Date,Status,Transaction ID"
    const content = (displayableTrades || []).map(t => [t.tokenName ? t.tokenName : t.tokenAddress, t.role, t.side, t.price, t.amount, t.amountBase, t.exchangeFee ? t.exchangeFee : '', t.exchangeFee ? t.takerExchangeFeeUnit : '', t.gasFee ? t.gasFee : '', t.date, t.status, t.txHash].join(","))

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