import React from "react"
import Date from "../CustomComponents/Date"
import Round from "../../components/CustomComponents/Round"
import Etherscan from "../CustomComponents/Etherscan"

export default class TransferRow extends React.Component {
    render() {
        const {tokenName, date, amount, txHash, status} = this.props.transfer

        return (
            <tr key={txHash}>
                <td>{tokenName}</td>
                <td><Round price>{amount}</Round></td>
                <td><Date year="true">{date}</Date></td>
                <td><span>{status}</span></td>
                <td><Etherscan type="tx" address={txHash} display="icon"/></td>
            </tr>
        )
    }
}