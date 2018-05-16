import React from "react"
import {Button} from 'reactstrap'
import * as AccountActions from "../../actions/AccountActions"
import TruncatedNumber from "../../components/CustomComponents/TruncatedNumber"
import {weiToEth} from "../../EtherConversion"

export default class AccountTableRow extends React.Component {
    showModal(isEth, isDeposit) {
        AccountActions.depositWithdraw(isEth, isDeposit)
    }

    render() {
        const {token, walletBalanceWei, exchangeBalanceWei, accountsEnabled} = this.props
        const disabledClass = accountsEnabled ? "" : "disabled"

        return (
            <tr>
                <td>
                    <div>{token.name}</div>
                    <div>
                        <Button size="sm" color="primary"
                                onClick={() => {if (accountsEnabled) this.showModal(token.name === "ETH", true)}}
                                className={disabledClass}>Deposit</Button>{' '}

                        <Button size="sm" color="primary"
                                onClick={() => {if (accountsEnabled) this.showModal(token.name === "ETH", false)}}
                                className={disabledClass}>Withdraw</Button>{' '}
                    </div>
                </td>
                <td><TruncatedNumber length="8">{String(weiToEth(walletBalanceWei, token.decimals))}</TruncatedNumber>
                </td>
                <td><TruncatedNumber
                    length="8">{String(weiToEth(exchangeBalanceWei, token.decimals))}</TruncatedNumber></td>
            </tr>
        )
    }
}
