import React from "react"
import { Button } from 'reactstrap'
import * as AccountActions from "../../actions/AccountActions"
import Config from '../../Config'
import TruncatedNumber from "../../components/CustomComponents/TruncatedNumber"
import { tokWeiToEth } from "../../EtherConversion";

export default class AccountTableRow extends React.Component {
    constructor(props) {
        super(props)
    }

    showModal(isEth, isDeposit) {
        AccountActions.depositWithdraw(isEth, isDeposit)
    }

    render() {
        const { token, tokenAddress, walletBalanceWei, exchangeBalanceWei } = this.props

        return (
            <tr>
                <td>
                    <Button size="sm" color="primary" onClick={() => this.showModal(token === "ETH", true)}>Deposit</Button>{' '}
                    <Button size="sm" color="primary" onClick={() => this.showModal(token === "ETH", false)}>Withdraw</Button>{' '}
                </td>
                <td>{token}</td>
                <td><TruncatedNumber length="8">{String(tokWeiToEth(walletBalanceWei, tokenAddress))}</TruncatedNumber></td>
                <td><TruncatedNumber length="8">{String(tokWeiToEth(exchangeBalanceWei, tokenAddress))}</TruncatedNumber></td>
            </tr>
        )
    }
}
