import React from "react"
import AccountRow from "../Account/AccountRow"
import Config from "../../Config"

export default class AccountTable extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        const {
            token,
            walletBalanceEthWei,
            walletBalanceTokWei,
            exchangeBalanceEthWei,
            exchangeBalanceTokWei } = this.props
        return (
            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>+ / -</th>
                        <th>Token</th>
                        <th>Wallet</th>
                        <th>Exchange</th>
                    </tr>
                </thead>
                <tbody>
                    <AccountRow token={"ETH"}
                        tokenAddress={Config.getBaseAddress()}
                        walletBalanceWei={walletBalanceEthWei}
                        exchangeBalanceWei={exchangeBalanceEthWei}
                    />
                    <AccountRow token={token.name}
                        tokenAddress={token.address}
                        walletBalanceWei={walletBalanceTokWei}
                        exchangeBalanceWei={exchangeBalanceTokWei}
                    />
                </tbody>
            </table>
        )
    }
}