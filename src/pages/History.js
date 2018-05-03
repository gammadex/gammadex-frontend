import React, {Component} from 'react'
import Transfers from '../components/Transfers'
import MyTrades from '../components/MyTrades'

class History extends Component {
    render() {
        return (
            <div className="row">
                <div className="col-lg-1"></div>
                <div className="col-lg-10">
                    <Transfers/>
                    <MyTrades/>
                </div>
                <div className="col-lg-1"></div>
            </div>
        )
    }
}

export default History
