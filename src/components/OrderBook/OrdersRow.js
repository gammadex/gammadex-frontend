import React from "react"
import * as TradeActions from "../../actions/TradeActions"
import Round from "../CustomComponents/Round"
import * as OpenOrderApi from "../../apis/OpenOrderApi"

export default class OrdersTableRow extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { order, rowClass, isMine } = this.props
        let myOrderIndicator = null
        if(isMine) {
            myOrderIndicator = <i className="fas fa-user"></i>
        }
        return (
            <tr key={order.id} onClick={() => TradeActions.fillOrder(order)} className="clickable">
                <td className={rowClass}><Round price softZeros>{order.price}</Round>&nbsp;&nbsp;&nbsp;{myOrderIndicator}</td>
                <td><Round>{order.ethAvailableVolume}</Round></td>
                <td><Round>{order.ethAvailableVolumeBase}</Round></td>
            </tr>
        )
    }
}
