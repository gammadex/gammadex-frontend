import React from "react"
import Config from '../Config'
import TimerRelay from "../TimerRelay"
import DepositHistoryTable from "./DepositHistory/DepositHistoryTable"
import OrderState from "../OrderState"
import * as AccountActions from "../actions/AccountActions"
import DepositType from "../DepositType"
import TransactionStatus from "../TransactionStatus"
import DepositHistoryStore from "../stores/DepositHistoryStore"
import { Box } from "./CustomComponents/Box"

export default class DepositHistory extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            depositHistory: DepositHistoryStore.getDepositHistoryState().depositHistory
        }
    }

    componentWillMount() {
        DepositHistoryStore.on("change", () =>
            this.setState({ depositHistory: DepositHistoryStore.getDepositHistoryState().depositHistory }))
        TimerRelay.on("change", () => this.timerFired())
    }

    componentWillUnmount() {
        DepositHistoryStore.removeListener("change", () =>
            this.setState({ depositHistory: DepositHistoryStore.getDepositHistoryState().depositHistory }))
        TimerRelay.removeListener("change", () => this.timerFired())
    }

    timerFired() {
        this.state.depositHistory.filter(d => d.status === TransactionStatus.PENDING).forEach(d => {
            AccountActions.refreshDeposit(d)
        })
    }

    render() {
        const { depositHistory } = this.state
        return (
            <Box title="Deposit / Withdrawal History">
                <DepositHistoryTable depositHistory={depositHistory} />
            </Box>
        )
    }
}