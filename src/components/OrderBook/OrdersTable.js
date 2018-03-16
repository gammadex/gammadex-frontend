import React from "react"
import OrdersRow from './OrdersRow'
import * as JsxUtils from "../../JsxUtils"

export default class OrdersTable extends React.Component {
    render() {
        const { base, token, orders, orderTypeColName, pageSize, openOrderHashes } = this.props

        const rows = orders.map((order) => <OrdersRow key={order.id} order={order}
            isMine={openOrderHashes.includes(order.id.split("_")[0].toLowerCase())} />)

        const numEmptyRows = pageSize - orders.length
        const emptyRows = JsxUtils.emptyRows(numEmptyRows, 3)

        return (
            <table className="table table-striped table-bordered table-hover">
                <thead>
                    <tr>
                        <th>{orderTypeColName} ({base})</th>
                        <th>Size ({token})</th>
                        <th>Total ({base})</th>
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