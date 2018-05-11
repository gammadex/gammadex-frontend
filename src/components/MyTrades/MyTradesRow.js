import React from "react"
import Date from "../CustomComponents/Date"
import Round from "../../components/CustomComponents/Round"
import Etherscan from "../CustomComponents/Etherscan"

export default class MyTradesRow extends React.Component {
    render() {
        const { market, side, price, tokenName, amount, amountBase, date, txHash, status } = this.props.trade

        return (
            <tr>
                <td>{market}</td>
                <td>{side}</td>
                <td><Round price softZeros>{price}</Round></td>
                <td><Round>{amount}</Round> {tokenName}</td>
                <td>{amountBase}</td>
                <td><Date year>{date}</Date></td>
                <td>{status}</td>
                <td><Etherscan type="tx" address={txHash} display="icon"/></td>
            </tr>
        )
    }
}
