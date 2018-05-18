import React from "react"
import Config from '../../Config'
import { Button } from "reactstrap"
import OrderState from "../../OrderState"
import OrderSide from "../../OrderSide"
import Date from "../CustomComponents/Date"
import Round from "../CustomComponents/Round"
import TokenListApi from "../../apis/TokenListApi"
import * as OpenOrderApi from "../../apis/OpenOrderApi"
import GasPriceStore from "../../stores/GasPriceStore"
import { tokenAddress, makerSide, tokenAmountWei } from "../../OrderUtil"
import { tokWeiToEth, safeBigNumber } from "../../EtherConversion"

export default class OpenOrdersRow extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            currentGasPriceWei: GasPriceStore.getCurrentGasPriceWei()
        }

        this.onGasStoreChange = this.onGasStoreChange.bind(this)
        this.cancelOrder = this.cancelOrder.bind(this)
    }

    componentDidMount() {
        GasPriceStore.on("change", this.onGasStoreChange)
    }

    componentWillUnmount() {
        GasPriceStore.removeListener("change", this.onGasStoreChange)
    }

    onGasStoreChange() {
        this.setState({
            currentGasPriceWei: GasPriceStore.getCurrentGasPriceWei()
        })
    }

    cancelOrder() {
        if (!this.props.isPendingCancel) {
            OpenOrderApi.requestOrderCancel(this.props.openOrder, this.state.currentGasPriceWei)
        }
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
        
        const cancelOrderButton = <a href="#/" id={openOrder.id + "CancelOrder"} onClick={this.cancelOrder}>
            <i className="fas fa-trash-alt sell-red"></i>
        </a>

        return (
            <tr>
                <td>{`${tokenName}/ETH`}</td>
                <td>{side}</td>
                <td><Round price softZeros>{openOrder.price}</Round></td>
                <td><Round>{tokenAmountEth.toString()}</Round> {tokenName}</td>
                <td><Round>{ethAmount}</Round></td>
                <td><Date year="true">{openOrder.updated}</Date></td>
                <td>{status}</td>
                <td>{cancelOrderButton}</td>
            </tr>
        )
    }
}
