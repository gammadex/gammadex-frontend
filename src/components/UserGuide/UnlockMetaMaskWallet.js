import React, { Component } from 'react'
import { clickPersonIcon, exchangePageDisplayed } from './CommonText'

class UnlockMetaMaskWallet extends Component {
    render() {
        return (
            <div className="user-guide-detail-container">
                <h4>Unlock a MetaMask wallet</h4>
                <img className="user-guide-image" src="/user_guide/unlock-metamask.gif" />
                <p>Ensure your <a target="_blank" rel="noopener noreferrer" href="https://metamask.io/">MetaMask</a> Extension is unlocked and connected to the Main Ethereum Network.</p>
                {clickPersonIcon()}
                <p>Click [ <i className="fas fa-sign-in-alt text-muted"></i>&nbsp;&nbsp;Unlock Wallet ]</p>
                <p>Click [ MetaMask ]</p>
                {exchangePageDisplayed()}
                <h4>Next steps</h4>              
            </div>
        )
    }
}

export default UnlockMetaMaskWallet
