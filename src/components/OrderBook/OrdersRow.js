import React from "react"
import * as TradeActions from "../../actions/TradeActions"
import Round from "../CustomComponents/Round"

export default class OrdersTableRow extends React.Component {

    showTradeModal(order) {
        TradeActions.executeTrade(order)
    }

    render() {
        const {order, isMine, rowClass} = this.props

        let mine = (isMine) ? " [mine]" : ""

        return (
            <tr key={order.id} onClick={() => this.showTradeModal(order)} className="clickable">
                <td className={rowClass}><Round price>{order.price}</Round></td>
                <td><Round>{order.ethAvailableVolume}</Round></td>
                <td><Round>{order.ethAvailableVolumeBase}{mine}</Round></td>
            </tr>
        )
    }
}
