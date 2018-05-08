import React from "react"
import Config from '../../Config'
import TransactionStatus from "../../TransactionStatus"
import DepositType from "../../DepositType"
import {tokWeiToEth} from "../../EtherConversion"
import Date from "../CustomComponents/Date"
import Round from "../../components/CustomComponents/Round"
import Etherscan from "../CustomComponents/Etherscan"
import TokenListApi from "../../apis/TokenListApi";

export default class TransferRow extends React.Component {
    render() {
        const {tokenAddr, date, kind, amount, txHash, status} = this.props.transfer
        const tokenName = TokenListApi.getTokenName(tokenAddr)
        const statusDescription = this.getStatusDescription(status)

        return (
            <tr key={txHash}>
                <td>{(kind === DepositType.DEPOSIT) ? "Deposit" : "Withdrawal"}</td>
                <td>{tokenName}</td>
                <td><Round price>{String(tokWeiToEth(amount, tokenAddr))}</Round></td>
                <td><Date year="true">{date}</Date></td>
                <td><span>{statusDescription}</span></td>
                <td><Etherscan type="tx" address={txHash} display="icon"/></td>
            </tr>
        )
    }

    getStatusDescription(status) {
        if (status === TransactionStatus.COMPLETE) {
            return "Complete"
        } else if (status === TransactionStatus.FAILED) {
            return "Failed"
        } else {
            return "Pending"
        }
    }
}