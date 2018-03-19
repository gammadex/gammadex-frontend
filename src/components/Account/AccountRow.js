import React from "react"
import { Button } from 'reactstrap'
import * as AccountActions from "../../actions/AccountActions"
import Config from '../../Config'
import TruncatedNumber from "../../components/CustomComponents/TruncatedNumber"

export default class AccountTableRow extends React.Component {
    constructor(props) {
        super(props)
    }

    showModal(isEth, isDeposit) {
        AccountActions.depositWithdraw(isEth, isDeposit)
    }

    render() {
        const { token, decimals, walletBalanceWei, exchangeBalanceWei } = this.props

        return (
            <tr>
                <td>
                    <Button color="primary" onClick={() => this.showModal(token === "ETH", true)}>Deposit</Button>{' '}
                    <Button color="primary" onClick={() => this.showModal(token === "ETH", false)}>Withdraw</Button>{' '}
                </td>
                <td>{token}</td>
                <td><TruncatedNumber>{Number(walletBalanceWei) / Math.pow(10, Number(decimals))}</TruncatedNumber></td>
                <td><TruncatedNumber>{Number(exchangeBalanceWei) / Math.pow(10, Number(decimals))}</TruncatedNumber></td>
            </tr>
        )
    }
}
