import React from "react"
import TradeHistoryRow from './TradeHistoryRow'
import * as JsxUtils from "../../JsxUtils"

export default class TradeHistoryTable extends React.Component {
    render() {
        const {base, token, trades, pageSize} = this.props

        const rows = trades.map(trade => <TradeHistoryRow key={trade.txHash} trade={trade}/>)

        const numEmptyRows = pageSize - trades.length
        const emptyRows = JsxUtils.emptyRows(numEmptyRows, 6)

        return (
            <table className="table table-striped table-bordered">
                <thead>
                <tr>
                    <th>Price</th>
                    <th>Size ({token})</th>
                    <th>Total ({base})</th>
                    <th>Side</th>
                    <th>Time</th>
                    <th>View on Etherscan.io</th>
                </tr>
                </thead>
                <tbody>
                {rows}
                {emptyRows}
                </tbody>
            </table>
        )
    }
}