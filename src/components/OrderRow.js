import React from "react"

export default class OrderRow extends React.Component {
    render() {
        const {order} = this.props

        return (
            <tr id={order.id}>
                <td>{order.ethAvailableVolumeBase}</td>
                <td>{order.ethAvailableVolume}</td>
                <td>{order.price}</td>
            </tr>
        )
    }
}
