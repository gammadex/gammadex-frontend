import React, {Component} from 'react'
import Transfers from '../components/Transfers'
import MyTrades from '../components/MyTrades'

class History extends Component {
    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-lg-1"></div>
                    <div className="col-lg-5 pr-2">
                        <Transfers type="Deposit" title="Deposit History"/>
                    </div>
                    <div className="col-lg-5 pl-2">
                        <Transfers type="Withdraw" title="Withdraw History"/>
                    </div>
                    <div className="col-lg-1"></div>
                </div>
                <div className="row">
                    <div className="col-lg-1"></div>
                    <div className="col-lg-10">
                        <MyTrades/>
                    </div>
                    <div className="col-lg-1"></div>
                </div>
            </div>
        )
    }
}

export default History
