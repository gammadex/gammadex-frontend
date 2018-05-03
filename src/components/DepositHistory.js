import React from "react"
import TimerRelay from "../TimerRelay"
import DepositHistoryTable from "./DepositHistory/DepositHistoryTable"
import * as AccountActions from "../actions/AccountActions"
import TransactionStatus from "../TransactionStatus"
import DepositHistoryStore from "../stores/DepositHistoryStore"
import {Box} from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"

export default class DepositHistory extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            transfers: DepositHistoryStore.getCompletedTransfers(),
            depositHistory: DepositHistoryStore.getDepositHistoryState().depositHistory
        }
        this.timerFired = this.timerFired.bind(this)
        this.depositHistoryChanged = this.depositHistoryChanged.bind(this)
    }

    componentDidMount() {
        DepositHistoryStore.on("change", this.depositHistoryChanged)
        TimerRelay.on("change", this.timerFired)
    }

    componentWillUnmount() {
        DepositHistoryStore.removeListener("change", this.depositHistoryChanged)
        TimerRelay.removeListener("change", this.timerFired)
    }

    depositHistoryChanged() {
        console.log("depositHistoryChanged in DepositHistory")

        this.setState({
            transfers: DepositHistoryStore.getCompletedTransfers(),
            depositHistory: DepositHistoryStore.getDepositHistoryState().depositHistory
        })
    }

    timerFired() {
        /*
        this.state.depositHistory.filter(d => d.status === TransactionStatus.PENDING).forEach(d => {
            AccountActions.refreshDeposit(d)
        })
        */
    }

    render() {
        const {depositHistory, transfers} = this.state


        console.log("transfers", transfers)

        let content = <EmptyTableMessage>You have no open deposits or withdrawls</EmptyTableMessage>
        if (transfers && transfers.length > 0) {
            content = <DepositHistoryTable depositHistory={transfers}/>
        }

        return (
            <Box title="Deposit / Withdrawal History">
                {content}
            </Box>
        )
    }
}