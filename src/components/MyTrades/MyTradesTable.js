import React from "react"
import MyTradesRow from "./MyTradesRow"

export default class MyTradesTable extends React.Component {
    render() {
        const {trades} = this.props

        // we rely on the backend to de-dupe myTrades and solely rely on the array index as the unique identifier as a proxy for:
        // txHash + logIndex + (some dupe id if account is both buyer and seller)
        const rows = trades.map((trade, i) => {
            return <MyTradesRow key={`${trade.txHash}_${i}`} trade={trade}/>
        })

        return (
            <div className="table-responsive my-trades-history">
                <table className="table table-striped table-bordered">
                    <thead>
                    <tr>
                        <th>Market</th>
                        <th>Role</th>
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