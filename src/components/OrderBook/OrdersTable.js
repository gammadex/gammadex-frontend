import React from "react"
import OrdersRow from './OrdersRow'

export default class OrdersTable extends React.Component {
    render() {
        const {base, token, orders, orderTypeColName} = this.props

        const rows = orders.map((order) => {
            return <OrdersRow key={order.id} order={order}/>
        })

        return (
            <table className="table table-striped table-bordered">
                <thead>
                <tr>
                    <th>Total ({base})</th>
                    <th>Size ({token})</th>
                    <th>{orderTypeColName} ({base})</th>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </table>
        )
    }
}