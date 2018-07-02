import React from "react"
import OrdersRow from './OrdersRow'
import * as JsxUtils from "../../JsxUtils"

export default class OrdersTable extends React.Component {
    render() {
        const {orders, orderType, rowClass, openOrderIds, pendingCancelIds} = this.props
        const rows = orders.map((order) =>
            <OrdersRow key={order.id} order={order} rowClass={rowClass} isMine={openOrderIds.includes(order.id)}
                       isPendingCancel={pendingCancelIds.includes(order.id)}/>)

        return (
            <div id={"orders-div-" + orderType} className="table-responsive">
                <table id={"order-table-" + orderType}
                       className="table table-bordered table-hover numbers-table orders-table">
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            </div>
        )
    }
}