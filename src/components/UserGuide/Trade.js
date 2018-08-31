import React, { Component } from 'react'
import { clickPersonIcon, exchangePageDisplayed } from './CommonText'
import { Alert } from 'reactstrap'

class Trade extends Component {
    render() {
        return (
            <div className="user-guide-detail-container">
                <h4>Trade against an order on the book</h4>
                <p>You must have ETH or tokens deposited in the exchange to trade.</p>
                <Alert color="info" transition={{ baseClass: '', timeout: 0 }}>
                    <strong>Trades in GammaDEX</strong>
                    <hr />
                    <div>
                        <ul>
                            <li>You see a price on the order book that you are prepared to BUY/SELL at.</li>
                            <li>You want to exchange ETH for tokens (or vice versa) with another user immediately.</li>
                            <li>To trade, you will send a transaction to the Ethereum network. This will cost you gas.</li>
                            <li>The EtherDelta Smart Contract will charge a fee of 0.3% of the notional amount to process your trade.</li>
                            <li>GammaDEX does not charge a fee.</li>
                            <li>Your role in this transaction is the "taker", i.e. you are taking liquidity from the market.</li>
                        </ul>
                    </div>
                </Alert>
                <img className="user-guide-image" src="/user_guide/trade.gif" />

                <p>All the orders for the current token are shown in the BIDS AND OFFERS section. OFFERS (red) to sell in the top table. BIDS (green) to buy in the bottom table.</p>
                <p>Where the tables meet represents the current best bid and offer prices.</p>
                <img className="user-guide-image-small" src="/user_guide/best-prices.png" />
                <p>In the image above the best price you can immediately buy VERI for is 0.09233. The best price you can immediately sell VERI for is 0.0888.</p>
                <p>If you want to buy the token (and pay ETH), click on an order in the top OFFERS (red) table.</p>
                <p>If you want to sell the token (and receive ETH), click on an order in the bottom BIDS (green) table.</p>
                <p>The TRADE section to the left BIDS AND OFFERS will be populated with the price you have chosen.</p>
                <p>You control the amount of tokens to buy or sell. You can either type an amount or use the slider. You can also use the two shortcuts directly beneath the slider to pre-populate the relevant balance or order maximum amounts: [ Your ETH Balance ] or [ ETH remaining on order ].</p>
                <p>The total field (in ETH) will change with the amount and can be calculated as price * amount.</p>
                <p>To send the trade transaction click on [ BUY / SELL ] underneath the total field.</p>
                <p>You will be prompted to confirm the transaction either by GammaDEX (if using a private key based account) or in MetaMask.</p>
                <p>A blue (pending) popup will appear at the bottom left of the screen when the transaction has been submitted to the Ethereum network. Click on the transaction hash link to view your transaction in Etherscan.</p>
                <img className="user-guide-image" src="/user_guide/trade-confirmation.png" />
                <p>A green (confirmation) popup will appear at the bottom left of the screen when your transaction has been mined by the network.</p>
                <p>Your token and ETH exchange balance will update to reflect your trade in the BALANCES section.</p>
            </div>
        )
    }
}

export default Trade
