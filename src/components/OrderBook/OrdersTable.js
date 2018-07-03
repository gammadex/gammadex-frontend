import React from "react"
import OrdersRow from './OrdersRow'
import CustomScroll from 'react-custom-scroll'
import 'react-custom-scroll/dist/customScroll.css'

export default class OrdersTable extends React.Component {
    render() {
        const {orders, orderType, rowClass, openOrderIds, pendingCancelIds, keepAtBottom} = this.props
        const rows = orders.map((order) =>
            <OrdersRow key={order.id} order={order} rowClass={rowClass} isMine={openOrderIds.includes(order.id)}
                       isPendingCancel={pendingCancelIds.includes(order.id)}/>)
        return (
            <CustomScroll heightRelativeToParent="100%" keepAtBottom={keepAtBottom}>
                <div id={"orders-div-" + orderType}>
                <table id={"order-table-" + orderType}
                       className="table table-bordered table-hover numbers-table orders-table">
                    <tbody>
                    {rows}
                    </tbody>
                </table>
                </div>
            </CustomScroll>
        )
    }
}