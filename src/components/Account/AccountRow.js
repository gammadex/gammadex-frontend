import React from "react"
import { Button } from 'reactstrap'
import * as AccountActions from "../../actions/AccountActions"
import Round from "../../components/CustomComponents/Round"
import { weiToEth } from "../../EtherConversion"
import Config from "../../Config"

export default class AccountTableRow extends React.Component {

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
                <td align="right"><Round price softZeros>{walletBalanceEth}</Round>&nbsp;&nbsp;&nbsp;{gasIndicator}</td>
                <td align="right"><Round price softZeros>{exchangeBalanceEth}</Round></td>
            </tr>
        )
    }
}
