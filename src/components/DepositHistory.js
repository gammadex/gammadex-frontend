import React from "react"
import Config from '../Config'
import TimerRelay from "../TimerRelay"
import DepositHistoryTable from "./DepositHistory/DepositHistoryTable"
import OrderState from "../OrderState"
import * as AccountActions from "../actions/AccountActions"
import DepositType from "../DepositType"
import TransactionStatus from "../TransactionStatus"
import DepositHistoryStore from "../stores/DepositHistoryStore"

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

    timerFired() {
        this.state.depositHistory.filter(d => d.status === TransactionStatus.PENDING).forEach(d => {
            AccountActions.refreshDeposit(d)
        })
    }

    render() {
        const { depositHistory } = this.state
        return (
            <div>
                <h2>Deposit/Withdrawal History</h2>
                <div className="row">
                    <div className="col-lg-12">
                        <DepositHistoryTable depositHistory={depositHistory} />
                    </div>
                </div>
            </div>
        )
    }
}