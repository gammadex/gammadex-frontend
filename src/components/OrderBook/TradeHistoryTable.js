import React from "react"
import TradeHistoryRow from './TradeHistoryRow'

export default class TradeHistoryTable extends React.Component {
    render() {
        const {base, token, trades} = this.props

        const rows = trades.map((trade) => {
            return <TradeHistoryRow key={trade.txHash} trade={trade}/>
        })

        return (
            <table className="table table-striped table-bordered">
                <thead>
                <tr>
                    <th>Price</th>
                    <th>Total ({base})</th>
                    <th>Size ({token})</th>
                    <th>Side</th>
                    <th>Time</th>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </table>
        )
    }
}