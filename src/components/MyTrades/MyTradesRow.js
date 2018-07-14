import React from "react"
import Date from "../CustomComponents/Date"
import Round from "../../components/CustomComponents/Round"
import TokenLink from "../../components/CustomComponents/TokenLink"
import Etherscan from "../CustomComponents/Etherscan"

export default class MyTradesRow extends React.Component {
    render() {
        const {refreshInProgress, tokenIdentifier} = this.props
        const { tokenAddress, role, side, price, tokenName, amount, amountBase, date, txHash, status, exchangeFee, takerExchangeFeeUnit, gasFee } = this.props.trade
        const refreshClass = refreshInProgress ? "faded" : ""
        return (
            <tr className={refreshClass}>
                <td><TokenLink tokenName={tokenName} tokenAddress={tokenAddress} tokenIdentifier={tokenIdentifier} pair/></td>
                <td>{role}</td>
                <td>{side}</td>
                <td><Round price softZeros>{price}</Round></td>
                <td><Round>{amount}</Round> {tokenName}</td>
                <td>{amountBase}</td>
                <td><Round price softZeros fallback="0" passThrough="">{exchangeFee}</Round>{exchangeFee ? ` ${takerExchangeFeeUnit}` : ''}</td>
                <td><Round price softZeros fallback="0" passThrough="">{gasFee}</Round></td>
                <td><Date year>{date}</Date></td>
                <td>{status}</td>
                <td><Etherscan type="tx" address={txHash} display="icon"/></td>
            </tr>
        )
    }
}
