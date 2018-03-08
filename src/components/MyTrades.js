import React from "react"
import Config from '../Config'
import AccountStore from "../stores/AccountStore"
import MyTradesStore from "../stores/MyTradesStore"
import TimerRelay from "../TimerRelay"
import TradeStatus from "../TradeStatus"
import MyTradesTable from "./MyTrades/MyTradesTable"
import * as MyTradeActions from "../actions/MyTradeActions"

export default class MyTrades extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            account: null,
            trades: MyTradesStore.getMyTradesState().trades
        }
    }

    componentWillMount() {
        AccountStore.on("change", () => this.updateAccountState())
        MyTradesStore.on("change", () => this.updateMyTradesState())
        TimerRelay.on("change", () => this.timerFired())
    }

    updateAccountState() {
        const { account } = AccountStore.getAccountState()
        this.setState({ account: account })
    }

    updateMyTradesState() {
        const { trades } = MyTradesStore.getMyTradesState()
        this.setState({ trades: trades })
    }

    timerFired() {
        this.state.trades.filter(trade => trade.status === TradeStatus.PENDING).forEach(trade => {
            MyTradeActions.refreshMyTrade(trade.txHash)
        })
    }

    render() {
        const { account, trades } = this.state
        let accountTrades = []
        if (account) {
            accountTrades = trades.filter(trade => {
                return trade.account.toLowerCase() === account.toLowerCase()
            })
        }
        return (
            <div>
                <h2>My Trades</h2>
                <div className="row">
                    <div className="col-lg-12">
                        <MyTradesTable trades={accountTrades} />
                    </div>
                </div>
            </div>
        )
    }
}