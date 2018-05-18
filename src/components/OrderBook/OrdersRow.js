import React from "react"
import * as TradeActions from "../../actions/TradeActions"
import Round from "../CustomComponents/Round"
import * as OpenOrderApi from "../../apis/OpenOrderApi"
import GasPriceStore from "../../stores/GasPriceStore"

export default class OrdersTableRow extends React.Component {

    constructor(props) {
        super(props)
        this.cancelOrder = this.cancelOrder.bind(this)

        this.state = {
            currentGasPriceWei: GasPriceStore.getCurrentGasPriceWei()
        }

        this.onGasStoreChange = this.onGasStoreChange.bind(this)
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
            OpenOrderApi.requestOrderCancel(this.props.order, this.state.currentGasPriceWei)
        }
    }

    render() {
        const { order, rowClass, isMine } = this.props
        let cancelOrderButton = null
        if (isMine) {
            cancelOrderButton = <a href="#/" id={order.id + "OrderBookCancel"} onClick={this.cancelOrder}>
                <i className="fas fa-trash-alt sell-red"></i>
            </a>
        }
        return (
            <tr key={order.id} onClick={() => {if (!isMine) TradeActions.fillOrder(order)}} className="clickable">
                <td className={rowClass}><Round price softZeros>{order.price}</Round></td>
                <td><Round>{order.ethAvailableVolume}</Round></td>
                <td><Round>{order.ethAvailableVolumeBase}</Round></td>
                <td>{cancelOrderButton}</td>
            </tr>
        )
    }
}
