import React, { Component } from 'react'
import { clickPersonIcon, exchangePageDisplayed } from './CommonText'
import { Alert } from 'reactstrap'

class DepositEth extends Component {
    render() {
        return (
            <div className="user-guide-detail-container">
                <h4>Deposit ETH to exchange</h4>
                <p>You will require ETH in the exchange to create orders or trade against the order book.</p>
                <p>An ETH deposit involves sending an Ethereum transaction along with the desired amount of ETH from your wallet to the <a target="_blank" rel="noopener noreferrer" href="https://etherscan.io/address/0x8d12a197cb00d4747a1fe03395095ce2a5cc6819#code">EtherDelta Smart Contract</a>.</p>
                <p>When calculating how many ETH to deposit, you should remember to keep at least 0.01 ETH in your wallet as gas to cover future deposit, withdrawal and trade transactions.</p>
                <img className="user-guide-image" src="/user_guide/deposit-eth.gif" />
                <p>Deposits and withdrawals are controlled from the BALANCES section in the top left hand corner of the page.</p>
                <p>Enter the amount of ETH you wish to deposit into the input field directly underneath the ETH heading.</p>
                <Alert color="secondary">
                Hint: Click [ MAX ] to deposit the maximum ETH amount from your wallet to the exchange. GammaDEX will ensure 0.01 ETH is left in your wallet as gas for future transactions.
                </Alert>
                <p>Click [ Deposit ]</p>
                <p>A popup will appear confirming the deposit amount. Check the amount and confirm by clicking [ Deposit ETH ].</p>
                <p><strong>If you are using MetaMask</strong>, you will be required to confirm the Ethereum transaction in the MetaMask extension. Click [ CONFIRM ]</p>
                <p>A blue (pending) popup will appear at the bottom left of the screen when your transaction has been submitted to the Ethereum network. Click on the transaction hash link to view your transaction in Etherscan.</p>
                <img className="user-guide-image" src="/user_guide/deposit-eth-confirmation.png" />
                <p>A green (confirmation) popup will appear at the bottom left of the screen when your transaction has been mined by the network.</p>
                <p>Your ETH Exchange balance will update to reflect your deposit in the BALANCES section. At this point you can trade against the order book or create a new order.</p>
                <div className="dropdown-divider divider-padding"></div>
                <h4>Next steps</h4>              
            </div>
        )
    }
}

export default DepositEth
