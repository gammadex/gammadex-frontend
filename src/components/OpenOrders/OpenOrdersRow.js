import React from "react"
import Config from '../../Config'
import { Button } from "reactstrap"
import OrderState from "../../OrderState"
import OrderSide from "../../OrderSide"
import * as OpenOrderActions from "../../actions/OpenOrderActions"
import Date from "../CustomComponents/Date"
import TruncatedNumber from "../../components/CustomComponents/TruncatedNumber"

export default class OpenOrdersRow extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { openOrder } = this.props
        const tokenName = Config.getTokenName(openOrder.tokenAddress)
        let buttonColor = "danger"
        let buttonLabel = "CANCEL"
        let buttonDisabled = false
        let onClick = () => {
            OpenOrderActions.cancelOpenOrder(openOrder)
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
                <td><TruncatedNumber>{openOrder.price}</TruncatedNumber></td>
                <td><TruncatedNumber>{openOrder.amount}</TruncatedNumber> {tokenName}</td>
                <td><TruncatedNumber>{openOrder.price * openOrder.amount}</TruncatedNumber></td>
                <td><Date>{openOrder.timestamp}</Date></td>
                <td><Button outline color={buttonColor} disabled={buttonDisabled} onClick={onClick}>{buttonLabel}</Button>{' '}</td>
            </tr>
        )
    }
}
