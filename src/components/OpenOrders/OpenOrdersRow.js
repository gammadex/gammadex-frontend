import React from "react"
import Config from '../../Config'
import { Button } from "reactstrap"
import OrderState from "../../OrderState"
import OrderSide from "../../OrderSide"
import Date from "../CustomComponents/Date"
import Round from "../CustomComponents/Round"
import TokenListApi from "../../apis/TokenListApi"
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
        const { openOrder, isPendingCancel } = this.props
        const tokenAddr = tokenAddress(openOrder)
        const tokenName = TokenListApi.getTokenName(tokenAddr)
        const side = makerSide(openOrder) === OrderSide.SELL ? "Sell" : "Buy"
        const tokenAmountEth = tokWeiToEth(tokenAmountWei(openOrder), tokenAddr)
        const ethAmount = safeBigNumber(openOrder.price).times(tokenAmountEth).toString()
        let status = "Unfilled"
        if (!safeBigNumber(openOrder.amountFilled).isZero()) {
            status = "Partial Fill"
        }

        const cancelOrderButton =
            <button className={"btn btn-danger btn-sm"} disabled={isPendingCancel}
                onClick={this.cancelOrder}><i className="fas fa-times" />
            </button>
            
        return (
            <tr>
                <td>{`${tokenName}/ETH`}</td>
                <td>{side}</td>
                <td><Round price softZeros>{openOrder.price}</Round></td>
                <td><Round>{tokenAmountEth.toString()}</Round> {tokenName}</td>
                <td><Round>{ethAmount}</Round></td>
                <td><Date year="true">{openOrder.date}</Date></td>
                <td>{status}</td>
                <td>{cancelOrderButton}</td>
            </tr>
        )
    }
}
