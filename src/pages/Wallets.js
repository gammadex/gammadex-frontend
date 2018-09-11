import React, {Component} from 'react'
import WalletChooser from '../components/WalletChooser'
import {withRouter} from "react-router-dom"
import {withAnalytics} from '../util/Analytics'

class Wallets extends Component {
    render() {
        return (
            <div className="row">
                <div className="col-lg-1"></div>
                <div className="col-lg-10"><WalletChooser/></div>
                <div className="col-lg-1"></div>
            </div>
        )
    }
}

export default withAnalytics(withRouter(Wallets))
