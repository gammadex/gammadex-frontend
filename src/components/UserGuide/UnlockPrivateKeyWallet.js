import React, { Component } from 'react'
import { clickPersonIcon, exchangePageDisplayed } from './CommonText'
import { Alert } from 'reactstrap'

class UnlockPrivateKeyWallet extends Component {
    render() {
        return (
            <div className="user-guide-detail-container">
                <h4>Unlock wallet using a Private Key</h4>
                <Alert color="warning" transition={{ baseClass: '', timeout: 0 }}>
                <i className="fas fa-exclamation-triangle"></i>&nbsp;&nbsp;<strong>This is not a recommended way to access your wallet.</strong> Entering your private key on a website is risky, which can leave you open to phishing attacks and loss of funds.
                </Alert>
                <img className="user-guide-image" src="/user_guide/unlock-private-key.gif" />
                {clickPersonIcon()}
                <p>Click [ <i className="fas fa-sign-in-alt text-muted"></i>&nbsp;&nbsp;Unlock Wallet ]</p>
                <p>Click [ Private Key ]</p>
                <p>Paste your private key into the input box</p>
                <p>If you want your wallet to be remembered between sessions, check [ Remember for next visit ].
                    You will be asked to choose a strong password of your choice, which is used to encrypt and securely store the private key in your browser's local storage.</p>
                <p>Click [ Unlock ]</p>
                {exchangePageDisplayed()}
                <div className="dropdown-divider divider-padding"></div>
                <h4>Next steps</h4>
            </div>
        )
    }
}

export default UnlockPrivateKeyWallet
