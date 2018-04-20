import React from "react"
import MyTradesRow from "./MyTradesRow"
import _ from "lodash"
import Config from "../../Config"

export default class MyTradesTable extends React.Component {
    render() {
        const {trades} = this.props
        const sortedTradesTimeDesc = _.reverse(_.sortBy(trades
            .filter(trade => trade.environment === Config.getReactEnv()), t => t.timestamp))
        const rows = sortedTradesTimeDesc.map(trade => <MyTradesRow key={trade.txHash} trade={trade}/>)
        return (
            <div className="table-responsive my-trades-history">
                <table className="table table-striped table-bordered">
                    <thead>
                    <tr>
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
            </div>
        )
    }
}