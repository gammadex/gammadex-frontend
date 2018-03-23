import React from "react"
import _ from "lodash"
import Config from "../../Config"
import DepositHistoryRow from "./DepositHistoryRow"

export default class DepositHistoryTable extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {depositHistory} = this.props
        const sortedDepositsTimeDesc = _.reverse(_.sortBy(depositHistory
            .filter(d => d.environment === Config.getReactEnv()), d => d.timestamp))
        const rows = sortedDepositsTimeDesc.map(d => <DepositHistoryRow key={d.txHash} depositHistory={d}/>)
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