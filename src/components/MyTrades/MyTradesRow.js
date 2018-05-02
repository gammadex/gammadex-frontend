import React from "react"
import Config from '../../Config'
import { Button } from "reactstrap"
import TransactionStatus from "../../TransactionStatus"
import OrderSide from "../../OrderSide"
import Date from "../CustomComponents/Date"
import Round from "../../components/CustomComponents/Round"
import TokenListApi from "../../apis/TokenListApi";

export default class MyTradesRow extends React.Component {
    render() {
        const { trade } = this.props
        const tokenName = TokenListApi.getTokenName(trade.tokenAddress)
        let statusColor = "warning"
        if (trade.status === TransactionStatus.COMPLETE) {
            statusColor = "success"
        } else if (trade.status === TransactionStatus.FAILED) {
            statusColor = "danger"
        }
        return (
            <tr>
                <td>{`${tokenName}/ETH`}</td>
                <td>{(trade.takerSide === OrderSide.SELL) ? "Sell" : "Buy"}</td>
                <td><Round price>{String(trade.price)}</Round></td>
                <td><Round>{String(trade.amountTok)}</Round> {tokenName}</td>
                <td></td>
                <td></td>
                <td>{String(trade.totalEth)}</td>
                <td><Date>{trade.timestamp}</Date></td>
                <td><Button outline color={statusColor} onClick={()=> window.open(`${Config.getEtherscanUrl()}/tx/${trade.txHash}`, "_blank")}>{trade.status}</Button>{' '}</td>
            </tr>
        )
    }
}
