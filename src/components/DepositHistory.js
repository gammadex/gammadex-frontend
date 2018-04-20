import React from "react"
import TimerRelay from "../TimerRelay"
import DepositHistoryTable from "./DepositHistory/DepositHistoryTable"
import * as AccountActions from "../actions/AccountActions"
import TransactionStatus from "../TransactionStatus"
import DepositHistoryStore from "../stores/DepositHistoryStore"
import { Box } from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"

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

        let content = <EmptyTableMessage>You have no open deposits or withdrawls</EmptyTableMessage>
        if (depositHistory && depositHistory.length > 0) {
            content = <DepositHistoryTable depositHistory={depositHistory} />
        }

        return (
            <Box title="Deposit / Withdrawal History">
                {content}
            </Box>
        )
    }
}