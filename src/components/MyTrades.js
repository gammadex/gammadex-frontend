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
            trades: MyTradesStore.getAllTrades()
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

    render() {
        const {trades} = this.state

        let content = <EmptyTableMessage>You have no trades</EmptyTableMessage>
        if (trades && trades.length > 0) {
            content = <MyTradesTable trades={trades}/>
        }

        return (
            <Box title="My Trades">
                {content}
            </Box>
        )
    }
}