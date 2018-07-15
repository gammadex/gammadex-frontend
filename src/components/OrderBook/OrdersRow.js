import React from "react"
import * as TradeActions from "../../actions/TradeActions"
import Round from "../CustomComponents/Round"
import * as OpenOrderApi from "../../apis/OpenOrderApi"

export default class OrdersTableRow extends React.Component {

    constructor(props) {
        super(props)
        this.onfillOrder = this.onfillOrder.bind(this)
    }

    onfillOrder = (event) => {
        const { order } = this.props
        event.preventDefault()
        TradeActions.fillOrder(order)
    }

    render() {
        const { order, rowClass, isMine, isSelectedFillOrder } = this.props
        let myOrderIndicator = null
        if(isMine) {
            myOrderIndicator = <i className="fas fa-user"></i>
        }
        let price = <Round price softZeros>{order.price}</Round>
        if(isSelectedFillOrder) {
            price = <strong>{price}</strong>
        }

        return (
            <tr key={order.id} onClick={this.onfillOrder} className="clickable">
                <td className={rowClass}>{price}&nbsp;&nbsp;&nbsp;{myOrderIndicator}</td>
                <td><Round>{order.ethAvailableVolume}</Round></td>
                <td><Round>{order.ethAvailableVolumeBase}</Round></td>
            </tr>
        )
    }
}
