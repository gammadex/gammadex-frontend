import React, { Component } from 'react'
import { Alert } from 'reactstrap'
import { clickPersonIcon, exchangePageDisplayed } from './CommonText'

class CreateWallet extends Component {
    render() {
        return (
            <div className="user-guide-detail-container">
                <h4>Create a new wallet</h4>
                <img className="user-guide-image" src="/user_guide/create-new-wallet.gif" />
                {clickPersonIcon()}
                <p>Choose [ <i className="fas fa-plus text-muted"></i> Create New Wallet ]</p>
                <p>GammaDEX randomly generates a new wallet address, shown at the top of the page next to a "blockie" image.</p>
                <p>Enter a strong password of your choice. This password is used to encrypt your private key, so make sure you keep it safe and do not share it with anyone.
                    The next time you visit the app, you will be prompted for this password.</p>
                <p>Click [ Encrypt Wallet ]</p>
                <p>Download your JSON keystore file and keep it safe. It contains your encrypted private key and can be used to unlock your wallet in a third party wallet manager such as MEW or MyCrypto.</p>
                <p>Click [ Understood. Get My Private Key ]</p>
                <p>GammaDEX will display your private key. Keep it safe and do not share the private key with anyone as you may risk losing your funds.</p>
                <p>Click [ Understood. Go to Exchange ]</p>
                {exchangePageDisplayed()}
                <h4>Next steps</h4>
                <Alert color="info">
                <i className="fas fa-gas-pump"></i>&nbsp;&nbsp;<strong>You need gas!</strong>
                <hr />
                Every action in GammaDEX (other than creating a new order and submitting it to the order book) involves sending a transaction to the Ethereum Network. This incurs a gas fee.
                The gas fee charged can vary based on the action being taken and the gas price you have currently selected. <br/><br/>
                We recommend you keep a minimum of 0.01 ETH in your wallet (not deposited in the exchange) to cover gas fees.<br/><br/>
                Your newly created GammaDEX wallet will contain zero ETH. You can transfer ETH from another wallet you own to the GammaDEX wallet using a third party tool such as MEW or MyCrypto.
                Your GammaDEX wallet address can be found in the top right hand corner of the screen.
                </Alert>
            </div>
        )
    }
}

export default CreateWallet
