import React, {Component} from 'react'
import Transfers from '../components/Transfers'
import MyTrades from '../components/MyTrades'

class History extends Component {
    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-lg-6 pr-2">
                        <Transfers type="Deposit" title="Deposit History"/>
                    </div>
                    <div className="col-lg-6 pl-2">
                        <Transfers type="Withdraw" title="Withdraw History"/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12">
                        <MyTrades/>
                    </div>
                </div>
            </div>
        )
    }
}

export default History
