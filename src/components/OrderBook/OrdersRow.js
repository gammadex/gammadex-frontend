import React from "react"
import * as TradeActions from "../../actions/TradeActions"
import Round from "../CustomComponents/Round"

export default class OrdersTableRow extends React.Component {

    render() {
        const {order, isMine, rowClass} = this.props

        let mine = (isMine) ? " [mine]" : ""

        return (
            <tr key={order.id} onClick={() => TradeActions.fillOrder(order)} className="clickable">
                <td className={rowClass}><Round price softZeros>{order.price}</Round></td>
                <td><Round>{order.ethAvailableVolume}</Round></td>
                <td><Round>{order.ethAvailableVolumeBase}{mine}</Round></td>
            </tr>
        )
    }
}
