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
        this.timerFired = this.timerFired.bind(this)
        this.depositHistoryChanged = this.depositHistoryChanged.bind(this)
    }

    componentWillMount() {
        DepositHistoryStore.on("change", this.depositHistoryChanged)
        TimerRelay.on("change", this.timerFired)
    }

    componentWillUnmount() {
        DepositHistoryStore.removeListener("change", this.depositHistoryChanged)
        TimerRelay.removeListener("change", this.timerFired)
    }

    depositHistoryChanged() {
        this.setState({ depositHistory: DepositHistoryStore.getDepositHistoryState().depositHistory })
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