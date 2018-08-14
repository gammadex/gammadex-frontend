import React, {Component} from 'react'
import Transfers from '../components/Transfers'
import MyTrades from '../components/MyTrades'

class History extends Component {
    render() {
        return (
            <div>
                <div className="row history-row">
                    <div className="col-lg-6 deposit-history-container">
                        <Transfers type="Deposit" title="Deposit History" id="deposit-history-container"/>
                    </div>
                    <div className="col-lg-6 withdraw-history-container">
                        <Transfers type="Withdraw" title="Withdraw History" id="withdraw-history-container"/>
                    </div>
                </div>
                <div className="row history-row">
                    <div className="col-lg-12 trade-history-container">
                        <MyTrades/>
                    </div>
                </div>
            </div>
        )
    }
}

export default History
