import React from "react"
import AccountStore from "../stores/AccountStore"
import TransfersTable from "./Transfers/TransfersTable"
import TransferStore from "../stores/TransferStore"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import Download from "./CustomComponents/Download"
import * as TransferDisplayUtil from "../util/TransferDisplayUtil"
import * as WebSocketActions from "../actions/WebSocketActions"
import MyTradesStore from "../stores/MyTradesStore"
import RefreshButton from "./CustomComponents/RefreshButton"

export default class Transfers extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            transfers: TransferStore.getAllTransfers().filter(t => t.kind === this.props.type),
            filter: "",
            account: AccountStore.getAccountState().account,
            refreshInProgress: TransferStore.isRefreshInProgress(),
        }

        this.depositHistoryChanged = this.depositHistoryChanged.bind(this)
        this.updateAccountState = this.updateAccountState.bind(this)
    }

    componentWillMount() {
        TransferStore.on("change", this.depositHistoryChanged)
        AccountStore.on("change", this.updateAccountState)
    }

    componentWillUnmount() {
        TransferStore.removeListener("change", this.depositHistoryChanged)
        AccountStore.removeListener("change", this.updateAccountState)
    }

    depositHistoryChanged() {
        this.setState({
            transfers: TransferStore.getAllTransfers().filter(t => t.kind === this.props.type),
            refreshInProgress: TransferStore.isRefreshInProgress(),
        })
    }

    updateAccountState() {
        this.setState({
            account: AccountStore.getAccountState().account
        })
    }

    refresh = () => {
        if (this.state.account && !this.state.refreshInProgress) {
            WebSocketActions.getMarket(true)
        }
    }

    filterChanged = (event) => {
        const filter = event.target.value
        this.setState({filter})
    }

    render() {
        const {transfers, filter, account, refreshInProgress} = this.state
        const {title, type} = this.props

        const displayTransfers = TransferDisplayUtil.toDisplayableTransfers(transfers)
        const csvContent = TransferDisplayUtil.transfersToCsv(displayTransfers)
        const filteredTransfers = displayTransfers.filter(
            t => `${t.tokenName}::${t.amount}::${t.date}::${t.status}::${t.txHash}`.toLowerCase().includes(filter.toLowerCase())
        )
        const disabledClass = account ? "" : "disabled"

        let content = <EmptyTableMessage>You have no deposits or withdrawls</EmptyTableMessage>
        if (!account) {
            content = <EmptyTableMessage>Please unlock a wallet to see {type.toLowerCase()} history</EmptyTableMessage>
        } else if (transfers && transfers.length > 0) {
            content = <TransfersTable transfers={filteredTransfers} refreshInProgress={refreshInProgress}/>
        }

        return (
            <div className="history-component">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">{title}</div>
                        <div className="form-inline">
                            <input placeholder="Search" className={"form-control mr-2 " + disabledClass}
                                   onChange={this.filterChanged}/>
                            <Download fileName="transfers.csv" contents={csvContent} mimeType="text/csv"
                                      className={"btn btn-primary btn-sm mr-2 " + disabledClass}><i
                                className="fas fa-download"/></Download>
                            <RefreshButton onClick={this.refresh}
                                           updating={refreshInProgress}
                                           disabled={!account || refreshInProgress}/>
                        </div>
                    </div>
                    {content}
                </div>
            </div>
        )
    }
}