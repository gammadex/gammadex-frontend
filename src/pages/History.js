import React, {Component} from 'react'
import DepositHistory from '../components/DepositHistory'
import MyTrades from '../components/MyTrades'

class History extends Component {
    render() {
        return (
            <div>
                <DepositHistory/>
                <MyTrades/>
            </div>
        )
    }
}

export default History
