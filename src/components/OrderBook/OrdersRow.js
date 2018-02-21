import React from "react"
import * as TradeActions from "../../actions/TradeActions"

export default class OrdersTableRow extends React.Component {

    showTradeModal(order) {
        TradeActions.executeTrade(order)
    }

    render() {
        const {order} = this.props

        return (
            <tr key={order.id} onClick={() => this.showTradeModal(order)}>
                <td>{order.price}</td>
                <td>{order.ethAvailableVolume}</td>
                <td>{order.ethAvailableVolumeBase}</td>
            </tr>
        )
    }
}
