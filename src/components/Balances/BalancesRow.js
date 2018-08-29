import React from "react"
import Round from "../../components/CustomComponents/Round"
import Etherscan from "../CustomComponents/Etherscan"
import Truncated from "../CustomComponents/Truncated"

export default class BalancesRow extends React.Component {
    render() {
        const {refreshInProgress } = this.props
        const { token, walletBalance, exchangeBalance, walletBalanceEth, walletBalanceUsd, exchangeBalanceEth, exchangeBalanceUsd } = this.props.balance

        const refreshClass = refreshInProgress ? "faded" : ""

        return (
            <tr className={refreshClass}>
                <td>{token.symbol}</td>
                <td><Truncated left={25} right="0">{token.name}</Truncated></td>
                <td><Round softZeros>{walletBalance}</Round></td>
                <td><Round softZeros suffix=" ETH">{walletBalanceEth}</Round></td>
                <td><Round softZeros decimals={2} prefix="$">{walletBalanceUsd}</Round></td>
                <td><Round softZeros>{exchangeBalance}</Round></td>
                <td><Round softZeros suffix=" ETH">{exchangeBalanceEth}</Round></td>
                <td><Round softZeros decimals={2} prefix="$">{exchangeBalanceUsd}</Round></td>
                <td><Etherscan type="address" display="long-truncate" tab="code">{token.address}</Etherscan>&nbsp;<Etherscan type="address" display="icon" tab="code">{token.address}</Etherscan></td>
            </tr>
        )
    }
}
