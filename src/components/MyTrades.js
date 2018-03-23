import React from "react"
import AccountStore from "../stores/AccountStore"
import MyTradesStore from "../stores/MyTradesStore"
import TimerRelay from "../TimerRelay"
import TransactionStatus from "../TransactionStatus"
import MyTradesTable from "./MyTrades/MyTradesTable"
import * as MyTradeActions from "../actions/MyTradeActions"
import {Box} from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"

export default class MyTrades extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            account: null,
            trades: MyTradesStore.getMyTradesState().trades
        }
        this.updateAccountState = this.updateAccountState.bind(this)
        this.updateMyTradesState = this.updateMyTradesState.bind(this)
        this.timerFired = this.timerFired.bind(this)
    }

    componentWillMount() {
        AccountStore.on("change", this.updateAccountState)
        MyTradesStore.on("change", this.updateMyTradesState)
        TimerRelay.on("change", this.timerFired)
    }

    componentWillUnmount() {
        AccountStore.removeListener("change", this.updateAccountState)
        MyTradesStore.removeListener("change", this.updateMyTradesState)
        TimerRelay.removeListener("change", this.timerFired)
    }

    updateAccountState() {
        const {account} = AccountStore.getAccountState()
        this.setState({account: account})
    }

    updateMyTradesState() {
        const {trades} = MyTradesStore.getMyTradesState()
        this.setState({trades: trades})
    }

    timerFired() {
        this.state.trades.filter(trade => trade.status === TransactionStatus.PENDING).forEach(trade => {
            MyTradeActions.refreshMyTrade(trade.txHash)
        })
    }

    render() {
        const {account, trades} = this.state
        let accountTrades = []
        if (account) {
            accountTrades = trades.filter(trade => {
                // ethereum wallet addresses are in hex, so A = a
                // https://forum.ethereum.org/discussion/9220/eth-address-upper-and-lower-characters-does-not-matter
                return trade.account.toLowerCase() === account.toLowerCase()
            })
        }

        let content = <EmptyTableMessage>You have no trades</EmptyTableMessage>
        if (accountTrades && accountTrades.length > 0) {
            content = <MyTradesTable trades={accountTrades}/>
        }

        return (
            <Box title="My Trades">
                {content}
            </Box>
        )
    }
}