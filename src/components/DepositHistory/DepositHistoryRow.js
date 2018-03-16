import React from "react"
import Config from '../../Config'
import { Button } from "reactstrap"
import TransactionStatus from "../../TransactionStatus"
import DepositType from "../../DepositType"

export default class DepositHistoryRow extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { depositHistory } = this.props
        const tokenName = Config.getTokenName(depositHistory.tokenAddress)
        let statusColor = "warning"
        if (depositHistory.status === TransactionStatus.COMPLETE) {
            statusColor = "success"
        } else if (depositHistory.status === TransactionStatus.FAILED) {
            statusColor = "danger"
        }
        return (
            <tr>
                <td>{depositHistory.timestamp}</td>
                <td>{(depositHistory.depositType === DepositType.DEPOSIT) ? "Deposit" : "Withdrawal"}</td>
                <td>{tokenName}</td>
                <td>{depositHistory.amount}</td>
                <td><Button outline color={statusColor} onClick={()=> window.open(`${Config.getEtherscanUrl()}/tx/${depositHistory.txHash}`, "_blank")}>{depositHistory.status}</Button>{' '}</td>
            </tr>
        )
    }
}
