import React from "react"
import {Button} from 'reactstrap'
import * as AccountActions from "../../actions/AccountActions"
import TruncatedNumber from "../../components/CustomComponents/TruncatedNumber"
import {tokWeiToEth} from "../../EtherConversion"

export default class AccountTableRow extends React.Component {
    showModal(isEth, isDeposit) {
        AccountActions.depositWithdraw(isEth, isDeposit)
    }

    render() {
        const {token, tokenAddress, walletBalanceWei, exchangeBalanceWei} = this.props

        return (
            <tr>
                <td>
                    <div>{token}</div>
                    <div>
                        <Button size="sm" color="primary"
                                onClick={() => this.showModal(token === "ETH", true)}>Deposit</Button>{' '}
                        <Button size="sm" color="primary" onClick={() => this.showModal(token === "ETH", false)}>Withdraw</Button>{' '}
                    </div>
                </td>
                <td><TruncatedNumber length="8">{String(tokWeiToEth(walletBalanceWei, tokenAddress))}</TruncatedNumber>
                </td>
                <td><TruncatedNumber
                    length="8">{String(tokWeiToEth(exchangeBalanceWei, tokenAddress))}</TruncatedNumber></td>
            </tr>
        )
    }
}
