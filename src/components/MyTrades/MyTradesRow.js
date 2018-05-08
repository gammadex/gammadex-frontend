import React from "react"
import Config from '../../Config'
import { Button } from "reactstrap"
import TransactionStatus from "../../TransactionStatus"
import OrderSide from "../../OrderSide"
import Date from "../CustomComponents/Date"
import Round from "../../components/CustomComponents/Round"
import TokenListApi from "../../apis/TokenListApi";
import Etherscan from "../CustomComponents/Etherscan"

export default class MyTradesRow extends React.Component {
    render() {
        const { tokenAddr, side, price, amount, amountBase, date, txHash, status } = this.props.trade
        const tokenName = TokenListApi.getTokenName(tokenAddr)
        const statusDescription = this.getStatusDescription(status)

        return (
            <tr>
                <td>{`${tokenName}/ETH`}</td>
                <td>{(side.toLowerCase() === OrderSide.SELL.toLowerCase()) ? "Sell" : "Buy"}</td>
                <td><Round price>{String(price)}</Round></td>
                <td><Round>{String(amount)}</Round> {tokenName}</td>
                <td>{String(amountBase)}</td>
                <td><Date year>{date}</Date></td>
                <td>{statusDescription}</td>
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
