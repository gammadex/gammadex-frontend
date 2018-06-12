import React, {Component} from 'react'
import WalletCreator from '../components/WalletCreator'

class NewWallet extends Component {
    render() {
        return (
            <div className="row">
                <div className="col-lg-1"></div>
                <div className="col-lg-10"><WalletCreator/></div>
                <div className="col-lg-1"></div>
            </div>
        )
    }
}

export default NewWallet