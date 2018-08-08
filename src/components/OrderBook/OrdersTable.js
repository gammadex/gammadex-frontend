import React from "react"
import OrdersRow from './OrdersRow'
import Scroll from "../CustomComponents/Scroll"

export default class OrdersTable extends React.Component {
    render() {
        const {orders, orderType, rowClass, openOrderIds, pendingCancelIds, keepAtBottom, fillOrder} = this.props
        const rows = orders.map((order) => {
            return <OrdersRow key={order.id} order={order} rowClass={rowClass} isMine={openOrderIds.includes(order.id)}
            isPendingCancel={pendingCancelIds.includes(order.id)}
            isSelectedFillOrder={(fillOrder == null || fillOrder.order.id != order.id) ? false : true}/>
        })

        return (
            <Scroll>
                <div id={"orders-div-" + orderType}>
                <table id={"order-table-" + orderType}
                       className="table table-bordered table-hover numbers-table orders-table">
                    <tbody>
                    {rows}
                    </tbody>
                </table>
                </div>
            </Scroll>
        )
    }
}