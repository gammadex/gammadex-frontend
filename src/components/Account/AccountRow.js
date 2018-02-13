import React from "react"
import { Button } from 'reactstrap'
import * as AccountActions from "../../actions/AccountActions"

export default class AccountTableRow extends React.Component {
    constructor(props) {
        super(props)
    }

    showModal(isEth, isDeposit) {
        AccountActions.depositWithdraw(isEth, isDeposit)
    }

    render() {
        const { token, decimals, walletBalanceWei, exchangeBalanceWei, transaction } = this.props

        return (
            <tr>
                <td>
                    <Button color="primary" onClick={() => this.showModal(token === "ETH", true)}>Deposit</Button>{' '}
                    <Button color="primary" onClick={() => this.showModal(token === "ETH", false)}>Withdraw</Button>{' '}
                </td>
                <td>{token}</td>
                <td>{Number(walletBalanceWei) / Math.pow(10, Number(decimals))}</td>
                <td>{Number(exchangeBalanceWei) / Math.pow(10, Number(decimals))}</td>
                <td>{(transaction ? <a href={`https://ropsten.etherscan.io/tx/${transaction}`}>{transaction}</a> : "")}</td>
            </tr>
        )
    }
}
