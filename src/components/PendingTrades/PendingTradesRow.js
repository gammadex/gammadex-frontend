import React from "react"
import Date from "../CustomComponents/Date"
import Round from "../CustomComponents/Round"
import Etherscan from "../CustomComponents/Etherscan"

export default class PendingTradesRow extends React.Component {
    render() {
        const { takerSide, tokenName, price, amount, amountBase, date, txHash, status } = this.props.trade
        const buySellClass = (takerSide === 'Sell') ?  'sell-red' : 'buy-green'

        return (
            <tr>
                <td>{tokenName}/ETH</td>
                <td className={buySellClass}>{takerSide}</td>
                <td><Round price softZeros>{price}</Round></td>
                <td><Round>{amount}</Round> {tokenName}</td>
                <td><Round>{amountBase}</Round></td>
                <td><Date year>{date}</Date></td>
                <td>{status}</td>
                <td><Etherscan type="tx" address={txHash} display="icon"/></td>
            </tr>
        )
    }
}
