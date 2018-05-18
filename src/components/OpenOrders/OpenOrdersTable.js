import React from "react"
import _ from "lodash"
import Config from "../../Config"
import OpenOrdersRow from "./OpenOrdersRow"
import OrderState from "../../OrderState"

export default class OpenOrdersTable extends React.Component {
    render() {
        const { openOrders, pendingCancelIds } = this.props
        const rows = openOrders.map(o => <OpenOrdersRow key={o.id} openOrder={o} isPendingCancel={pendingCancelIds.includes(o.id)} />)
        return (
            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>Market</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Amount</th>
                        <th>Total (ETH)</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        )
    }
}