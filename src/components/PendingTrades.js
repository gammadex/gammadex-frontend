import React from "react"
import AccountStore from "../stores/AccountStore"
import MyTradesStore from "../stores/MyTradesStore"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import * as TradeDisplayUtil from "../util/TradeDisplayUtil"
import {Box} from "./CustomComponents/Box"
import TransactionStatus from "../TransactionStatus"
import PendingTradesTable from "./PendingTrades/PendingTradesTable"
import Conditional from "./CustomComponents/Conditional"

export default class PendingTrades extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            trades: MyTradesStore.getAllTrades(),
            account: AccountStore.getAccountState().account,
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
            trades: MyTradesStore.getAllTrades()
        })
    }

    render() {
        const {trades, account} = this.state

        const pendingAndFailedTrades = trades.filter(t => t.status !== TransactionStatus.COMPLETE)
        const displayTrades = TradeDisplayUtil.toDisplayableTrades(pendingAndFailedTrades, account)

        return (
            <Box title="My Pending Trades" className="last-card">
                <Conditional displayCondition={!!account}
                             fallbackMessage="Please unlock a wallet to see your pending trades">
                    <Conditional displayCondition={displayTrades && displayTrades.length > 0}
                                 fallbackMessage="You have no pending trades">
                        <PendingTradesTable trades={displayTrades}/>
                    </Conditional>
                </Conditional>
            </Box>
        )
    }
}