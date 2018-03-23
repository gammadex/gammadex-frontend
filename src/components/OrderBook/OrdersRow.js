import React from "react"
import * as TradeActions from "../../actions/TradeActions"
import TruncatedNumber from "../../components/CustomComponents/TruncatedNumber"

export default class OrdersTableRow extends React.Component {

    showTradeModal(order) {
        TradeActions.executeTrade(order)
    }

    render() {
        const {order, isMine, rowClass} = this.props

        let mine = (isMine) ? " [mine]" : ""

        return (
            <tr key={order.id} onClick={() => this.showTradeModal(order)} className={"clickable " + rowClass}>
                <td><TruncatedNumber decimals="8">{order.price}</TruncatedNumber></td>
                <td><TruncatedNumber decimals="8">{order.ethAvailableVolume}</TruncatedNumber></td>
                <td><TruncatedNumber decimals="8">{order.ethAvailableVolumeBase}{mine}</TruncatedNumber></td>
            </tr>
        )
    }
}
