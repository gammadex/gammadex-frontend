import React from "react"
import Date from "../CustomComponents/Date"
import Round from "../../components/CustomComponents/Round"
import TokenLink from "../../components/CustomComponents/TokenLink"
import Etherscan from "../CustomComponents/Etherscan"

export default class BalancesRow extends React.Component {
    render() {
        const {refreshInProgress } = this.props
        const { token, walletBalance, exchangeBalance, walletBalanceEth, walletBalanceUsd, exchangeBalanceEth, exchangeBalanceUsd } = this.props.balance

        const refreshClass = refreshInProgress ? "faded" : ""

        return (
            <tr className={refreshClass}>
                <td>{token.symbol}</td>
                <td>{token.name}</td>
                <td><Round softZeros>{walletBalance}</Round></td>
                <td><Round softZeros suffix=" ETH">{walletBalanceEth}</Round></td>
                <td><Round softZeros decimals={2} prefix="$">{walletBalanceUsd}</Round></td>
                <td><Round softZeros>{exchangeBalance}</Round></td>
                <td><Round softZeros suffix=" ETH">{exchangeBalanceEth}</Round></td>
                <td><Round softZeros decimals={2} prefix="$">{exchangeBalanceUsd}</Round></td>
                <td><Etherscan type="address" display="long-truncate" tab="code">{token.address}</Etherscan></td>
            </tr>
        )
    }
}
