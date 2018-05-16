import React from "react"
import AccountRow from "../Account/AccountRow"
import Config from "../../Config"
import TokenListApi from "../../apis/TokenListApi";

export default class AccountTable extends React.Component {
    render() {
        const {
            token,
            walletBalanceEthWei,
            walletBalanceTokWei,
            exchangeBalanceEthWei,
            exchangeBalanceTokWei,
            accountsEnabled
        } = this.props
        return (
            <table className="table table-striped table-bordered table-no-bottom-border">
                <thead>
                <tr>
                    <th>Token</th>
                    <th>Wallet</th>
                    <th>Exchange</th>
                </tr>
                </thead>
                <tbody>
                <AccountRow token={TokenListApi.find({name: "ETH"})}
                            walletBalanceWei={walletBalanceEthWei}
                            exchangeBalanceWei={exchangeBalanceEthWei}
                            accountsEnabled={accountsEnabled}
                />
                <AccountRow token={token}
                            walletBalanceWei={walletBalanceTokWei}
                            exchangeBalanceWei={exchangeBalanceTokWei}
                            accountsEnabled={accountsEnabled}
                />
                </tbody>
            </table>
        )
    }
}