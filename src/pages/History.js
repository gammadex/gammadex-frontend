import React, {Component} from 'react'
import Transfers from '../components/Transfers'
import MyTrades from '../components/MyTrades'

class History extends Component {
    render() {
        return (
            <div>
                <div className="row history-row">
                    <div className="col-lg-6 deposit-history-container" style={{"padding-left":"6px", "padding-right":"3px"}}>
                        <Transfers type="Deposit" title="Deposit History"/>
                    </div>
                    <div className="col-lg-6 withdraw-history-container" style={{"padding-left":"3px", "padding-right":"6px"}}>
                        <Transfers type="Withdraw" title="Withdraw History"/>
                    </div>
                </div>
                <div className="row history-row">
                    <div className="col-lg-12 trade-history-container" style={{"padding":"6px 6px 0 6px"}}>
                        <MyTrades/>
                    </div>
                </div>
            </div>
        )
    }
}

export default History
