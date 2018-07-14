import React from "react"
import Date from "../CustomComponents/Date"
import Round from "../../components/CustomComponents/Round"
import Etherscan from "../CustomComponents/Etherscan"
import TokenLink from "../CustomComponents/TokenLink"

export default class TransferRow extends React.Component {
    render() {
        const {refreshInProgress, tokenIdentifier} = this.props
        const {tokenName, tokenAddress, date, amount, txHash, status} = this.props.transfer

        const refreshClass = refreshInProgress ? "faded" : ""

        return (
            <tr  className={refreshClass}>
                <td><TokenLink tokenName={tokenName} tokenAddress={tokenAddress} tokenIdentifier={tokenIdentifier}/></td>
                <td><Round price softZeros>{amount}</Round></td>
                <td><Date year={true}>{date}</Date></td>
                <td><span>{status}</span></td>
                <td><Etherscan type="tx" address={txHash} display="icon"/></td>
            </tr>
        )
    }
}