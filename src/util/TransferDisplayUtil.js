import TransactionStatus from "../TransactionStatus"
import {tokWeiToEth} from "../EtherConversion"
import TokenRepository from "./TokenRepository";
import DepositType from "../DepositType"

export function toDisplayableTransfers(transfers) {
    return transfers.map(t => ({
            kind: (t.kind === DepositType.DEPOSIT) ? "Deposit" : "Withdrawal",
            tokenName: TokenRepository.getTokenName(t.tokenAddr),
            amount: String(tokWeiToEth(t.amount, t.tokenAddr)),
            date: t.date,
            status: getStatusDescription(t.status),
            txHash: t.txHash
        })
    )
}

export function transfersToCsv(displayableTransfers) {
    const header = "Type,Asset,Amount,Date,Status,Transaction ID"
    const content = (displayableTransfers || []).map(t => [t.kind, t.tokenName, t.amount, t.date, t.status, t.txHash].join(","))

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