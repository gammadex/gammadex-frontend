import React from "react"
import TransfersTable from "./Transfers/TransfersTable"
import TransferStore from "../stores/TransferStore"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import Download from "./CustomComponents/Download"
import * as TransferDisplayUtil from "../util/TransferDisplayUtil"
import * as WebSocketActions from "../actions/WebSocketActions"

export default class Transfers extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            transfers: TransferStore.getAllTransfers().filter(t => t.kind === this.props.type),
            filter: "",
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
            transfers: TransferStore.getAllTransfers().filter(t => t.kind === this.props.type),
        })
    }

    refresh = () => {
        WebSocketActions.getMarket()
    }

    filterChanged = (event) => {
        const filter = event.target.value
        this.setState({filter})
    }

    render() {
        const {transfers, filter} = this.state
        const {title} = this.props

        const displayTransfers = TransferDisplayUtil.toDisplayableTransfers(transfers)
        const csvContent = TransferDisplayUtil.transfersToCsv(displayTransfers)
        const filteredTransfers = displayTransfers.filter(
            t => `${t.tokenName}::${t.amount}::${t.date}::${t.status}::${t.txHash}`.includes(filter)
        )

        let content = <EmptyTableMessage>You have no deposits or withdrawls</EmptyTableMessage>
        if (transfers && transfers.length > 0) {
            content = <TransfersTable transfers={filteredTransfers}/>
        }

        return (
            <div className="card history-table">
                <div className="card-header">
                    <div className="row hdr-stretch">
                        <div className="col-lg-6">
                            <strong className="card-title">{title}</strong>
                        </div>
                        <div className="col-lg-6 red">
                            <div className="float-right form-inline">
                                <input placeholder="Search" className="form-control mr-2"
                                       onChange={this.filterChanged}/>
                                <Download fileName="transfers.csv" contents={csvContent} mimeType="text/csv"
                                          className="btn btn-primary mr-2"><i className="fas fa-download"/></Download>
                                <button className="btn btn-primary" onClick={this.refresh}><i className="fas fa-sync"/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {content}
            </div>
        )
    }
}