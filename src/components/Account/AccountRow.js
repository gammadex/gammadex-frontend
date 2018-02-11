import React from "react"

export default class AccountTableRow extends React.Component {
    render() {
        const {token, decimals, walletBalanceWei, exchangeBalanceWei} = this.props

        return (
            <tr>
                <td>
                    <button type="button" className="btn btn-sm btn-primary table-button">Deposit</button>
                    <button type="button" className="btn btn-sm btn-primary table-button">Withdraw</button>
                </td>
                <td>{token}</td>
                <td>{Number(walletBalanceWei) / Math.pow(10, Number(decimals))}</td>
                <td>{Number(exchangeBalanceWei) / Math.pow(10, Number(decimals))}</td>
            </tr>
        )
    }
}
