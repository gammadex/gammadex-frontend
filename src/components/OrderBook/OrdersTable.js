import React from "react"
import OrdersRow from './OrdersRow'
import * as JsxUtils from "../../JsxUtils"

export default class OrdersTable extends React.Component {
    render() {
        const { base, token, orders, orderTypeColName, pageSize, rowClass, openOrderIds, pendingCancelIds } = this.props
        const rows = orders.map((order) =>
            <OrdersRow key={order.id} order={order} rowClass={rowClass} isMine={openOrderIds.includes(order.id)} isPendingCancel={pendingCancelIds.includes(order.id)} />)

        const numEmptyRows = pageSize - orders.length
        const emptyRows = JsxUtils.emptyRows(numEmptyRows, 3)

        return (
            <div className="table-responsive orders-table">
                <table className="table table-striped table-bordered table-hover table-no-bottom-border">
                    <thead>
                        <tr>
                            <th>{orderTypeColName} ({base})</th>
                            <th>Size ({token})</th>
                            <th>Total ({base})</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                        {emptyRows}
                    </tbody>
                </table>
            </div>
        )
    }
}