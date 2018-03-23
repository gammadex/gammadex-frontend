import React from "react"
import TradeHistoryRow from './TradeHistoryRow'
import * as JsxUtils from "../../JsxUtils"

export default class TradeHistoryTable extends React.Component {
    render() {
        const {base, token, trades, pageSize} = this.props

        const rows = trades.map(trade => <TradeHistoryRow key={trade.txHash} trade={trade}/>)

        const numEmptyRows = pageSize - trades.length
        const emptyRows = JsxUtils.emptyRows(numEmptyRows, 4)

        return (
            <div className="table-responsive token-chooser">
                <table className="table table-striped table-bordered table-no-bottom-border">
                    <thead>
                    <tr>
                        <th>Price</th>
                        <th>Size ({token})</th>
                        <th>Total ({base})</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    {emptyRows}
                    </tbody>
                </table>
            </div>
        )
    }
}