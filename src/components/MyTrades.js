import React from "react"
import AccountStore from "../stores/AccountStore"
import MyTradesStore from "../stores/MyTradesStore"
import MyTradesTable from "./MyTrades/MyTradesTable"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import Download from "./CustomComponents/Download"
import * as TradeDisplayUtil from "../util/TradeDisplayUtil"
import * as WebSocketActions from "../actions/WebSocketActions"

export default class MyTrades extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            trades: MyTradesStore.getAllTrades(),
            filter: "",
        }
        this.updateMyTradesState = this.updateMyTradesState.bind(this)
    }

    componentWillMount() {
        MyTradesStore.on("change", this.updateMyTradesState)
    }

    componentWillUnmount() {
        MyTradesStore.removeListener("change", this.updateMyTradesState)
    }

    updateAccountState() {
        const {account} = AccountStore.getAccountState()
        this.setState({
            account: account
        })
    }

    updateMyTradesState() {
        this.setState({
            trades: MyTradesStore.getAllTrades()
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
        const {trades, filter} = this.state

        const displayTrades = TradeDisplayUtil.toDisplayableTrades(trades)
        const csvContent = TradeDisplayUtil.tradesToCsv(displayTrades)
        const filteredTrades = displayTrades.filter(
            t => `${t.market}::${t.side}::${t.price}::${t.tokenName}::${t.amount}::${t.amountBase}::${t.date}::${t.txHash}::${t.status}`.includes(filter)
        )

        let content = <EmptyTableMessage>You have no trades</EmptyTableMessage>
        if (trades && trades.length > 0) {
            content = <MyTradesTable trades={filteredTrades}/>
        }

        return (
            <div className="card history-table">
                <div className="card-header">
                    <div className="row hdr-stretch">
                        <div className="col-lg-6">
                            <strong className="card-title">Trade History</strong>
                        </div>
                        <div className="col-lg-6 red">
                            <div className="float-right form-inline">
                                <input placeholder="Search" className="form-control mr-2"
                                       onChange={this.filterChanged}/>
                                <Download fileName="trades.csv" contents={csvContent} mimeType="text/csv"
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