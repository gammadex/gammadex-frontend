import React from "react"
import Config from '../../Config'
import { Button } from "reactstrap"
import TransactionStatus from "../../TransactionStatus"
import DepositType from "../../DepositType"
import { tokWeiToEth } from "../../EtherConversion"
import Date from "../CustomComponents/Date"
import Round from "../../components/CustomComponents/Round"
import TokenListApi from "../../apis/TokenListApi";

export default class DepositHistoryRow extends React.Component {
    render() {
        const { tokenAddress, status, timestamp, depositType, amount, txHash } = this.props.depositHistory
        const tokenName = TokenListApi.getTokenName(tokenAddress)
        let statusColor = "warning"
        if (status === TransactionStatus.COMPLETE) {
            statusColor = "success"
        } else if (status === TransactionStatus.FAILED) {
            statusColor = "danger"
        }
        return (
            <tr>
                <td><Date year="true">{timestamp}</Date></td>
                <td>{(depositType === DepositType.DEPOSIT) ? "Deposit" : "Withdrawal"}</td>
                <td>{tokenName}</td>
                <td><Round price>{String(tokWeiToEth(amount, tokenAddress))}</Round></td>
                <td><Button outline color={statusColor}
                    onClick={() => window.open(`${Config.getEtherscanUrl()}/tx/${txHash}`, "_blank")}>{status}</Button>{' '}</td>
            </tr>
        )
    }
}
