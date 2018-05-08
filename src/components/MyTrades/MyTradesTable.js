import React from "react"
import MyTradesRow from "./MyTradesRow"
import _ from "lodash"
import Config from "../../Config"

export default class MyTradesTable extends React.Component {
    render() {
        const {trades} = this.props

        console.log("trades", trades)

        const rows = trades.map(trade => <MyTradesRow key={trade.txHash} trade={trade}/>)

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