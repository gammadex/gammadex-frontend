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
            clearBalances
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
                    <AccountRow token={TokenListApi.find({ name: "ETH" })}
                        clearBalances={clearBalances}
                        walletBalanceWei={walletBalanceEthWei}
                        exchangeBalanceWei={exchangeBalanceEthWei}
                    />
                    <AccountRow token={token}
                        clearBalances={clearBalances}
                        walletBalanceWei={walletBalanceTokWei}
                        exchangeBalanceWei={exchangeBalanceTokWei}
                    />
                </tbody>
            </table>
        )
    }
}