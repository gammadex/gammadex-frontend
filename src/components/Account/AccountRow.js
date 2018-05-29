import React from "react"
import { Button } from 'reactstrap'
import * as AccountActions from "../../actions/AccountActions"
import * as OrderPlacementActions from "../../actions/OrderPlacementActions"
import * as FundingActions from "../../actions/FundingActions"
import Round from "../../components/CustomComponents/Round"
import { weiToEth } from "../../EtherConversion"
import Config from "../../Config"
import OrderBoxType from "../OrderPlacement/OrderBoxType"

export default class AccountTableRow extends React.Component {

    constructor(props) {
        super(props)
        this.selectWalletCell = this.selectWalletCell.bind(this)
        this.selectExchangeCell = this.selectExchangeCell.bind(this)
    }

    selectWalletCell() {
        OrderPlacementActions.orderBoxTypeChanged(OrderBoxType.FUNDING)
        const { token } = this.props
        if (token.address === Config.getBaseAddress()) {
            FundingActions.ethDepositMaxAmount()
        } else {
            FundingActions.tokDepositMaxAmount()
        }
    }

    selectExchangeCell() {
        OrderPlacementActions.orderBoxTypeChanged(OrderBoxType.FUNDING)
        const { token } = this.props
        if (token.address === Config.getBaseAddress()) {
            FundingActions.ethWithdrawalMaxAmount()
        } else {
            FundingActions.tokWithdrawMaxAmount()
        }  
    }

    render() {
        const { token, walletBalanceWei, exchangeBalanceWei } = this.props

        const walletBalanceEth = weiToEth(walletBalanceWei, token.decimals).toString()
        const exchangeBalanceEth = weiToEth(exchangeBalanceWei, token.decimals).toString()

        let gasIndicator = null
        if (token.address === Config.getBaseAddress()) {
            gasIndicator = <i className="fas fa-gas-pump"></i>
        }

        return (
            <tr>
                <td>
                    <div><strong>{token.name}</strong></div>
                </td>
                <td className="clickable" onClick={this.selectWalletCell} align="right"><Round price softZeros>{walletBalanceEth}</Round>&nbsp;&nbsp;&nbsp;{gasIndicator}</td>
                <td className="clickable" onClick={this.selectExchangeCell} align="right"><Round price softZeros>{exchangeBalanceEth}</Round></td>
            </tr>
        )
    }
}
