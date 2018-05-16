import React from "react"
import Config from '../../Config'
import { Button } from "reactstrap"
import OrderState from "../../OrderState"
import OrderSide from "../../OrderSide"
import Date from "../CustomComponents/Date"
import Round from "../CustomComponents/Round"
import TokenListApi from "../../apis/TokenListApi";
import * as OpenOrderApi from "../../apis/OpenOrderApi"

export default class OpenOrdersRow extends React.Component {
    render() {
        const { openOrder } = this.props
        const tokenName = TokenListApi.getTokenName(openOrder.tokenAddress)
        let buttonColor = "danger"
        let buttonLabel = "CANCEL"
        let buttonDisabled = false
        let onClick = () => {
            OpenOrderApi.cancelOpenOrder(openOrder)
        }
        if (openOrder.state === OrderState.PENDING_CANCEL) {
            buttonColor = "warning"
            buttonLabel = "PENDING"
            buttonDisabled = false
            const url = `${Config.getEtherscanUrl()}/tx/${openOrder.pendingCancelTx}`
            onClick = ()=> window.open(url, "_blank")
        }
        return (
            <tr>
                <td>{`${tokenName}/ETH`}</td>
                <td>{(openOrder.makerSide === OrderSide.SELL) ? "Sell" : "Buy"}</td>
                <td><Round price softZeros>{openOrder.price}</Round></td>
                <td><Round>{openOrder.amount}</Round> {tokenName}</td>
                <td><Round>{openOrder.price * openOrder.amount}</Round></td>
                <td><Date>{openOrder.timestamp}</Date></td>
                <td><Button outline color={buttonColor} disabled={buttonDisabled} onClick={onClick}>{buttonLabel}</Button>{' '}</td>
            </tr>
        )
    }
}
