import React from "react"
import MyTradesRow from "./MyTradesRow"
import _ from "lodash"

export default class MyTradesTable extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        const { trades } = this.props
        const sortedTradesTimeDesc = _.reverse(_.sortBy(trades, t => t.timestamp))
        const rows = sortedTradesTimeDesc.map(trade => {
            return <MyTradesRow key={trade.txHash} trade={trade} />
        })
        return (
            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>Transaction Hash</th>
                        <th>Market</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Amount</th>
                        <th>Fee</th>
                        <th>Gas Fee</th>
                        <th>Total (ETH)</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        )
    }
}