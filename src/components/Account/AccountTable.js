import React from "react"
import AccountRow from "../Account/AccountRow"
import Config from "../../Config"
import TokenRepository from "../../util/TokenRepository";

export default class AccountTable extends React.Component {
    render() {
        const {
            token,
            walletBalanceEthWei,
            walletBalanceTokWei,
            exchangeBalanceEthWei,
            exchangeBalanceTokWei,
            clearBalances,
            refreshing,
        } = this.props

        return (
            <table className="table table-striped table-bordered table-no-bottom-border">
                <thead>
                    <tr>
                        <th></th>
                        <th className="txt-right">Wallet</th>
                        <th className="txt-right">Exchange</th>
                    </tr>
                </thead>
                <tbody>
                    <AccountRow token={TokenRepository.find({ symbol: "ETH" })}
                        clearBalances={clearBalances}
                        walletBalanceWei={walletBalanceEthWei}
                        exchangeBalanceWei={exchangeBalanceEthWei}
                        refreshing={refreshing}
                    />
                    <AccountRow token={token}
                        clearBalances={clearBalances}
                        walletBalanceWei={walletBalanceTokWei}
                        exchangeBalanceWei={exchangeBalanceTokWei}
                        refreshing={refreshing}
                    />
                </tbody>
            </table>
        )
    }
}