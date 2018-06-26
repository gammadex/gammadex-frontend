import React from "react"
import PendingTradesRow from "./PendingTradesRow"

export default class PendingTradesTable extends React.Component {
    render() {
        const {trades} = this.props

        const rows = trades.map(trade => <PendingTradesRow key={trade.txHash} trade={trade}/>)

        return (
            <div className="table-responsive my-trades-history">
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
            </div>
        )
    }
}