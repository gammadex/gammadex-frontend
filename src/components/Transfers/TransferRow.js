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
        const [statusColour, statusDescription, spinner] = this.getStatusElements(status)

        return (
            <tr>
                <td><Date year="true">{date}</Date></td>
                <td>{(kind === DepositType.DEPOSIT) ? "Deposit" : "Withdrawal"}</td>
                <td>{tokenName}</td>
                <td><Round price>{String(tokWeiToEth(amount, tokenAddr))}</Round></td>
                <td><span className={statusColour}>{statusDescription} {spinner}</span></td>
                <td><Etherscan type="tx" address={txHash} display="icon"/></td>
            </tr>
        )
    }

    getStatusElements(status) {
        if (status === TransactionStatus.COMPLETE) {
            return ["success", "Complete", null]
        } else if (status === TransactionStatus.FAILED) {
            return ["danger", "Failed", null]
        } else {
            return ["warning", "Pending", <i className="fa fa-spinner fa-spin"/>]
        }
    }
}