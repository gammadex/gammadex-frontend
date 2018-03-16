import React from "react"
import _ from "lodash"
import Config from "../../Config"
import OpenOrdersRow from "./OpenOrdersRow"
import OrderState from "../../OrderState"

export default class OpenOrdersTable extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        const { openOrders } = this.props
        const sortedOrdersTimeDesc = _.reverse(_.sortBy(openOrders
            .filter(order => order.environment === Config.getReactEnv() && order.state != OrderState.CLOSED), o => o.timestamp))
        const rows = sortedOrdersTimeDesc.map(openOrder => <OpenOrdersRow key={openOrder.hash} openOrder={openOrder} />)
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
                        <th>Cancel</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        )
    }
}