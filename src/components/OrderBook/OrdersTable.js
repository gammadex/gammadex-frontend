import React from "react"
import OrdersRow from './OrdersRow'
import * as JsxUtils from "../../JsxUtils"

export default class OrdersTable extends React.Component {
    render() {
        const {base, token, orders, orderTypeColName, pageSize} = this.props

        const rows = orders.map((order) => {
            return <OrdersRow key={order.id} order={order}/>
        })

        const numEmptyRows = pageSize - orders.length
        const emptyRows = JsxUtils.emptyRows(numEmptyRows, 3)

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
                {emptyRows}
                </tbody>
            </table>
        )
    }
}