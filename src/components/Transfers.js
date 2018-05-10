import React from "react"
import TransfersTable from "./Transfers/TransfersTable"
import TransferStore from "../stores/TransferStore"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import Download from "./CustomComponents/Download"
import * as TransferDisplayUtil from "../util/TransferDisplayUtil"

export default class Transfers extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            transfers: TransferStore.getAllTransfers(),
        }

        this.depositHistoryChanged = this.depositHistoryChanged.bind(this)
    }

    componentDidMount() {
        TransferStore.on("change", this.depositHistoryChanged)
    }

    componentWillUnmount() {
        TransferStore.removeListener("change", this.depositHistoryChanged)
    }

    depositHistoryChanged() {
        this.setState({
            transfers: TransferStore.getAllTransfers(),
        })
    }

    refresh = () => {
    }

    render() {
        const {transfers} = this.state
        const displayTransfers = TransferDisplayUtil.toDisplayableTransfers(transfers)
        const csvContent = TransferDisplayUtil.transfersToCsv(displayTransfers)

        let content = <EmptyTableMessage>You have no deposits or withdrawls</EmptyTableMessage>
        if (transfers && transfers.length > 0) {
            content = <TransfersTable transfers={displayTransfers}/>
        }

        // <button className="btn btn-primary" onClick={this.refresh}><i className="fas fa-sync"></i></button>

        return (
            <div className="card token-chooser">
                <div className="card-header">
                    <div className="row hdr-stretch">
                        <div className="col-lg-6">
                            <strong className="card-title">Deposit / Withdrawal History</strong>
                        </div>
                        <div className="col-lg-6 red">
                            <div className="float-right">
                            <Download fileName="transfers.csv" contents={csvContent} mimeType="text/csv" className="btn btn-primary mr-2"><i className="fas fa-download"/></Download>

                            </div>
                        </div>
                    </div>
                </div>

                {content}
            </div>
        )
    }
}