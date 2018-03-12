import React from "react"
import Config from '../../Config'
import { Button } from "reactstrap"
import TradeStatus from "../../TradeStatus"
import OrderSide from "../../OrderSide"

export default class MyTradesRow extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { trade } = this.props
        const tokenName = Config.getTokenName(trade.tokenAddress)
        let statusColor = "warning"
        if (trade.status === TradeStatus.COMPLETE) {
            statusColor = "success"
        } else if (trade.status === TradeStatus.FAILED) {
            statusColor = "danger"
        }
        return (
            <tr>
                <td>{`${trade.txHash.substring(0, 20)}...`}</td>
                <td>{`${tokenName}/ETH`}</td>
                <td>{(trade.takerSide === OrderSide.SELL) ? "Sell" : "Buy"}</td>
                <td>{trade.price}</td>
                <td>{`${trade.amountTok} ${tokenName}`}</td>
                <td></td>
                <td></td>
                <td>{trade.totalEth}</td>
                <td>{trade.timestamp}</td>
                <td><Button outline color={statusColor} onClick={()=> window.open(`${Config.getEtherscanUrl()}/tx/${trade.txHash}`, "_blank")}>{trade.status}</Button>{' '}</td>
            </tr>
        )
    }
}
