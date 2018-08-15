import React from "react"
import TradeHistoryRow from './TradeHistoryRow'
import * as JsxUtils from "../../JsxUtils"

export default class TradeHistoryTable extends React.Component {

    render() {
        const { base, token, trades, pageSize, id } = this.props

        const rows = trades.map((trade, i) => {
            return <TradeHistoryRow key={`${trade.txHash}_${i}`} trade={trade} token={token} id={id}/>
        })

        const numEmptyRows = pageSize - trades.length
        const emptyRows = JsxUtils.emptyRows(numEmptyRows, 4)

        return (
                <table className="table table-bordered table-no-bottom-border numbers-table">
                    <thead>
                        <tr>
                            <th>Price</th>
                            <th>{token}</th>
                            <th>{base}</th>
                            <th className="before-etherscan-column">Date</th>
                            <th className="etherscan-column"></th>
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