import React from "react"
import TruncatedNumber from "../CustomComponents/TruncatedNumber"
import Etherscan from "../CustomComponents/Etherscan"

export default class OrdersTableRow extends React.Component {
    render() {
        const {trade} = this.props

        const side = (trade.side === 'buy') ? 'B' : 'S'
        const cssClass = (trade.side === 'buy') ? 'buy-green' : 'sell-red'

        return (
            <tr className={cssClass}>
                <td>{side}</td>
                <td><TruncatedNumber>{trade.price}</TruncatedNumber></td>
                <td><TruncatedNumber>{trade.amount}</TruncatedNumber></td>
                <td><TruncatedNumber>{trade.amountBase}</TruncatedNumber></td>
                <td>
                    <Etherscan type="tx" address={trade.txHash} display="icon"/>
                </td>
            </tr>
        )
    }
}