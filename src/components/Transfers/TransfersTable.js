import React from "react"
import _ from "lodash"
import Config from "../../Config"
import TransferRow from "./TransferRow"

export default class TransfersTable extends React.Component {
    render() {
        const {transfers} = this.props

        const rows = transfers.map(transfer => <TransferRow key={transfer.txHash} transfer={transfer}/>)

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