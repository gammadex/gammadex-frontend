import React, { Component } from 'react'
import { clickPersonIcon, exchangePageDisplayed } from './CommonText'
import { Alert } from 'reactstrap'

class DepositToken extends Component {
    render() {
        return (
            <div className="user-guide-detail-container">
                <h4>Deposit a Token to exchange</h4>
                <p>To sell tokens you need to deposit them to the exchange.</p>
                <p>You can deposit any ERC-20 Ethereum Token.</p>
                <p>A token deposit involves sending <strong>two</strong> Ethereum transactions to the Ethereum network. 
                The first transaction is sent to the token contract, to approve the deposit. 
                The second transaction is sent to the <a target="_blank" rel="noopener noreferrer" href="https://etherscan.io/address/0x8d12a197cb00d4747a1fe03395095ce2a5cc6819#code">EtherDelta Smart Contract</a>, which initiates the transfer from your wallet to the exchange.</p>
                <img className="user-guide-image" src="/user_guide/deposit-token.gif" />
                <p>Deposits are made from the BALANCES section in the top left hand corner of the page.</p>
                <p>Enter the amount of the token you wish to deposit into the input field directly underneath the token heading.</p>
                <Alert color="secondary">
                Hint: Click [ MAX ] to deposit the maximum token amount from your wallet to the exchange.
                </Alert>
                <p>Click [ Deposit ]</p>
                <p>A popup will appear confirming the deposit amount. Check the amount and confirm by clicking [ Deposit ].</p>
                <p><strong>If you are using MetaMask</strong>, you will be required to confirm two Ethereum transactions in the MetaMask extension. Click [ CONFIRM ] for both.</p>
                <div className="user-guide-inline">MetaMask may minimize pending confirmations, if this happens click on the MetaMask icon in the browser toolbar <img className="user-guide-image-inline" src="/user_guide/metamask-pending.png" /> to show the confirmation window.</div>

                <p>A blue (pending) popup will appear at the bottom left of the screen when each of the two transactions has been submitted to the Ethereum network. Click on the transaction hash link to view your transaction in Etherscan.</p>
                <img className="user-guide-image" src="/user_guide/deposit-token-confirmation.png" />
                <p>A green (confirmation) popup will appear at the bottom left of the screen when your transaction has been mined by the network.</p>
                <p>Your token exchange balance will update to reflect your deposit in the BALANCES section. At this point you can trade against the order book or create a new order.</p>
                <div className="dropdown-divider divider-padding"></div>
                <h4>Next steps</h4>              
            </div>
        )
    }
}

export default DepositToken
