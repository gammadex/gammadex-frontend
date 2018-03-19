import React from "react"
import Config from '../../Config'
import { Button } from "reactstrap"
import TransactionStatus from "../../TransactionStatus"
import DepositType from "../../DepositType"
import { tokWeiToEth } from "../../EtherConversion"
export default class DepositHistoryRow extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { tokenAddress, status, timestamp, depositType, amount, txHash } = this.props.depositHistory
        console.log(`${tokenAddress} ${status} ${timestamp} ${depositType} ${amount} ${txHash}`)
        const tokenName = Config.getTokenName(tokenAddress)
        let statusColor = "warning"
        if (status === TransactionStatus.COMPLETE) {
            statusColor = "success"
        } else if (status === TransactionStatus.FAILED) {
            statusColor = "danger"
        }
        return (
            <tr>
                <td>{timestamp}</td>
                <td>{(depositType === DepositType.DEPOSIT) ? "Deposit" : "Withdrawal"}</td>
                <td>{tokenName}</td>
                <td>{String(tokWeiToEth(amount, tokenAddress))}</td>
                <td><Button outline color={statusColor}
                    onClick={() => window.open(`${Config.getEtherscanUrl()}/tx/${txHash}`, "_blank")}>{status}</Button>{' '}</td>
            </tr>
        )
    }
}
