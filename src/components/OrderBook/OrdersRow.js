import React from "react"

export default class OrdersTableRow extends React.Component {
    render() {
        const {order} = this.props

        return (
            <tr key={order.id}>
                <td>{order.ethAvailableVolumeBase}</td>
                <td>{order.ethAvailableVolume}</td>
                <td>{order.price}</td>
            </tr>
        )
    }
}
