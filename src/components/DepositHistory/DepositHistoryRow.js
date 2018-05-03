import React from "react"
import Config from '../../Config'
import TransactionStatus from "../../TransactionStatus"
import DepositType from "../../DepositType"
import { tokWeiToEth } from "../../EtherConversion"
import Date from "../CustomComponents/Date"
import Round from "../../components/CustomComponents/Round"
import Etherscan from "../CustomComponents/Etherscan"
import TokenListApi from "../../apis/TokenListApi";

export default class DepositHistoryRow extends React.Component {
    render() {
        const { tokenAddr, date, kind, amount, txHash } = this.props.depositHistory
        const tokenName = TokenListApi.getTokenName(tokenAddr)

        return (
            <tr>
                <td><Date year="true">{date}</Date></td>
                <td>{(kind === DepositType.DEPOSIT) ? "Deposit" : "Withdrawal"}</td>
                <td>{tokenName}</td>
                <td><Round price>{String(tokWeiToEth(amount, tokenAddr))}</Round></td>
                <td><span color="success">Complete</span></td>
                <td><Etherscan type="tx" address={txHash} display="icon"/></td>
            </tr>
        )
    }
}
