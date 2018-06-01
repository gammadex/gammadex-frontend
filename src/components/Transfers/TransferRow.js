import React from "react"
import Date from "../CustomComponents/Date"
import Round from "../../components/CustomComponents/Round"
import Etherscan from "../CustomComponents/Etherscan"

export default class TransferRow extends React.Component {
    render() {
        const {refreshInProgress} = this.props
        const {tokenName, date, amount, txHash, status} = this.props.transfer

        const refreshClass = refreshInProgress ? "faded" : ""

        return (
            <tr  className={refreshClass}>
                <td>{tokenName}</td>
                <td><Round price softZeros>{amount}</Round></td>
                <td><Date year="true">{date}</Date></td>
                <td><span>{status}</span></td>
                <td><Etherscan type="tx" address={txHash} display="icon"/></td>
            </tr>
        )
    }
}