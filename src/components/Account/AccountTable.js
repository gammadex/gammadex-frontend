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
            exchangeBalanceTokWei,
            ethTransaction,
            tokTransaction,
            toggleModal } = this.props
        return (
            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>+ / -</th>
                        <th>Token</th>
                        <th>Wallet</th>
                        <th>Exchange</th>
                        <th>Activity</th>
                    </tr>
                </thead>
                <tbody>
                    <AccountRow token={base}
                        decimals={baseDecimals}
                        walletBalanceWei={walletBalanceEthWei}
                        exchangeBalanceWei={exchangeBalanceEthWei}
                        transaction={ethTransaction}
                        toggleModal={toggleModal}
                    />
                    <AccountRow token={token}
                        decimals={tokenDecimals}
                        walletBalanceWei={walletBalanceTokWei}
                        exchangeBalanceWei={exchangeBalanceTokWei}
                        transaction={tokTransaction}
                        toggleModal={toggleModal}
                    />
                </tbody>
            </table>
        )
    }
}