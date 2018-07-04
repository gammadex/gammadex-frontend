import React from "react"
import Config from '../../Config'
import { Button } from "reactstrap"
import OrderState from "../../OrderState"
import OrderSide from "../../OrderSide"
import Date from "../CustomComponents/Date"
import Round from "../CustomComponents/Round"
import TokenLink from "../CustomComponents/TokenLink"
import TokenRepository from "../../util/TokenRepository"
import * as OpenOrderApi from "../../apis/OpenOrderApi"
import { tokenAddress, makerSide, tokenAmountWei } from "../../OrderUtil"
import { tokWeiToEth, safeBigNumber } from "../../EtherConversion"

export default class OpenOrdersRow extends React.Component {
    constructor(props) {
        super(props)

        this.cancelOrder = this.cancelOrder.bind(this)
    }

    cancelOrder() {
        OpenOrderApi.requestOrderCancel(this.props.openOrder, this.props.currentGasPriceWei)
    }

    render() {
        const { openOrder, isPendingCancel, tokenExists } = this.props
        const tokenAddr = tokenAddress(openOrder)
        const tokenName = TokenRepository.getTokenName(tokenAddr)
        const side = makerSide(openOrder) === OrderSide.SELL ? "Sell" : "Buy"
        const buySellClass = (side === 'Sell') ?  'sell-red' : 'buy-green'

        const [tokenAmountEth, ethAmount] = this.getTokenAndEthAmounts(tokenExists, openOrder, tokenAddr)

        let status = "Unfilled"
        if (!safeBigNumber(openOrder.amountFilled).isZero() && !safeBigNumber(openOrder.amountGet).isZero()) {
            status = `${safeBigNumber(openOrder.amountFilled).div(safeBigNumber(openOrder.amountGet)).times(100).toFixed(1)}% Filled`
        }

        const cancelOrderButton =
            <button className={"btn btn-danger btn-tiny"} disabled={isPendingCancel}
                onClick={this.cancelOrder}><i className="fas fa-times" />
            </button>
            
        return (
            <tr>
                <td><TokenLink tokenAddress={tokenAddr} pair/></td>
                <td className={buySellClass}>{side}</td>
                <td><Round price softZeros>{openOrder.price}</Round></td>
                <td><Round>{tokenAmountEth}</Round> {tokenName}</td>
                <td><Round>{ethAmount}</Round></td>
                <td><Date year>{openOrder.updated}</Date></td>
                <td>{status}</td>
                <td className="button-row">{cancelOrderButton}</td>
            </tr>
        )
    }

    getTokenAndEthAmounts(tokenExists, openOrder, tokenAddr) {
        if (tokenExists) {
            const tokenAmountEth = tokWeiToEth(tokenAmountWei(openOrder), tokenAddr)
            const ethAmount = safeBigNumber(openOrder.price).times(tokenAmountEth).toString()

            return [String(tokenAmountEth), String(ethAmount)]
        }

        return [null, null]
    }
}
