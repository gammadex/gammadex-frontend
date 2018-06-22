import React from "react"
import AccountStore from "../stores/AccountStore"
import MyTradesStore from "../stores/MyTradesStore"
import MyTradesTable from "./MyTrades/MyTradesTable"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import Download from "./CustomComponents/Download"
import * as TradeDisplayUtil from "../util/TradeDisplayUtil"
import * as WebSocketActions from "../actions/WebSocketActions"
import _ from "lodash"
import RefreshButton from "./CustomComponents/RefreshButton"
import TradeRole from "../TradeRole"

export default class MyTrades extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            trades: MyTradesStore.getAllTrades(),
            filter: "",
            account: AccountStore.getAccountState().account,
            refreshInProgress: MyTradesStore.isRefreshInProgress(),
        }
        this.updateMyTradesState = this.updateMyTradesState.bind(this)
        this.updateAccount = this.updateAccount.bind(this)
    }

    componentWillMount() {
        MyTradesStore.on("change", this.updateMyTradesState)
        AccountStore.on("change", this.updateAccount)
    }

    componentWillUnmount() {
        MyTradesStore.removeListener("change", this.updateMyTradesState)
        AccountStore.removeListener("change", this.updateAccount)
    }

    updateAccount() {
        this.setState({
            account: AccountStore.getAccountState().account
        })
    }

    updateMyTradesState() {
        this.setState({
            trades: MyTradesStore.getAllTrades(),
            refreshInProgress: MyTradesStore.isRefreshInProgress(),
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
        const {trades, filter, account, refreshInProgress} = this.state

        const displayTrades = TradeDisplayUtil.toDisplayableTrades(trades, account)

        // expand out trades where account is both the maker and the taker
        const expandedTrades = _.flatMap(displayTrades, t => {
            if (t.side === "Both") {
                return [
                    Object.assign({}, t, {
                        side: t.takerSide,
                        role: TradeRole.TAKER,
                        exchangeFee: t.takerExchangeFee,
                        gasFee: t.takerGasFee
                    }),
                    Object.assign({}, t, {side: t.takerSide === "Buy" ? "Sell" : "Buy", role: TradeRole.MAKER})
                ]
            } else {
                return [t]
            }
        })

        const csvContent = TradeDisplayUtil.tradesToCsv(expandedTrades)
        const filteredTrades = expandedTrades.filter(
            t => `${t.tokenName ? t.tokenName : t.tokenAddress}::${t.role}::${t.side}::${t.price}::${t.tokenName}::${t.amount}::${t.amountBase}::${t.exchangeFee}::${t.gasFee}::${t.date}::${t.txHash}::${t.status}`.toLowerCase().includes(filter.toLowerCase())
        )
        const disabledClass = account ? "" : "disabled"

        let content = <EmptyTableMessage>You have no trades</EmptyTableMessage>
        if (!account) {
            content = <EmptyTableMessage>Please unlock a wallet to see your trade history</EmptyTableMessage>
        } else if (trades && trades.length > 0) {
            content = <MyTradesTable trades={filteredTrades} refreshInProgress={refreshInProgress}/>
        }

        return (
            <div className="history-component">
                <div className="card">
                    <div className="card-header">
                        <div className="row hdr-stretch">
                            <div className="col-lg-6">
                                <strong className="card-title">Trade History</strong>
                            </div>
                            <div className="col-lg-6">
                                <div className="float-right form-inline">
                                    <input placeholder="Search" className={"form-control mr-2 " + disabledClass}
                                           onChange={this.filterChanged}/>
                                    <Download fileName="trades.csv" contents={csvContent} mimeType="text/csv"
                                              className={"btn btn-primary mr-2 " + disabledClass}><i
                                        className="fas fa-download"/></Download>
                                    <RefreshButton onClick={this.refresh}
                                                   updating={refreshInProgress}
                                                   disabled={!account || refreshInProgress}/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {content}
                </div>
            </div>
        )
    }
}