import React from "react"
import Date from "../CustomComponents/Date"
import Round from "../CustomComponents/Round"
import Etherscan from "../CustomComponents/Etherscan"

export default class PendingTradesRow extends React.Component {
    render() {
        const { takerSide, tokenName, amount, amountBase, date, txHash, status } = this.props.trade
        const buySellClass = (takerSide === 'Sell') ?  'sell-red' : 'buy-green'

        return (
            <tr>
                <td className={buySellClass}>{takerSide} <Round>{amount}</Round> {tokenName}</td>
                <td><Date>{date}</Date></td>
                <td>{status}</td>
                <td><Etherscan type="tx" address={txHash} display="icon"/></td>
            </tr>
        )
    }
}
