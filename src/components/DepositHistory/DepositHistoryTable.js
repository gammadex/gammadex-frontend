import React from "react"
import _ from "lodash"
import Config from "../../Config"
import DepositHistoryRow from "./DepositHistoryRow"

export default class DepositHistoryTable extends React.Component {
    render() {
        const {depositHistory} = this.props
        const sortedDepositsTimeDesc = _.reverse(_.sortBy(depositHistory, d => d.timestamp))
        const rows = sortedDepositsTimeDesc.map(deposit => <DepositHistoryRow key={deposit.txHash} depositHistory={deposit}/>)

        return (
            <div className="table-responsive deposit-history">
                <table className="table table-striped table-bordered">
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Asset</th>
                        <th>Amount</th>
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