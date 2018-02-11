import React from "react"
import AccountRow from "../Account/AccountRow"

export default class AccountTable extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        const {
            base,
            token,
            baseDecimals,
            tokenDecimals,
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
                    <AccountRow token={base}
                        decimals={baseDecimals}
                        walletBalanceWei={walletBalanceEthWei}
                        exchangeBalanceWei={exchangeBalanceEthWei} />
                    <AccountRow token={token}
                        decimals={tokenDecimals}
                        walletBalanceWei={walletBalanceTokWei}
                        exchangeBalanceWei={exchangeBalanceTokWei} />
                </tbody>
            </table>
        )
    }
}