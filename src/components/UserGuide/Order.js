import React, { Component } from 'react'
import { Alert } from 'reactstrap'

class Order extends Component {
    render() {
        return (
            <div className="user-guide-detail-container">
                <h4>Place a new order</h4>
                <p>You must have ETH or tokens deposited in the exchange to place orders.</p>
                <Alert color="info" transition={{ baseClass: '', timeout: 0 }}>
                    <strong>Orders in GammaDEX</strong>
                    <hr />
                    <div>
                        <ul>
                            <li>You want to achieve a certain price and are willing to wait (indefinitely) for a buyer and seller to trade with you.</li>
                            <li>Creating an order involves signing a message using your wallet. The message itself is a hexadecimal string representing your signed intention to buy/sell an amount of some token in exchange for ETH.</li>
                            <li>Orders are stored "off-chain" (not on the Ethereum blockchain). This does not require an Ethereum transaction and will not incur gas fees.</li>
                            <li>Cancelling an order does send a transaction to the Ethereum network. This will cost you gas.</li>
                            <li>The EtherDelta Smart Contract does not charge a fee for placing an order.</li>
                            <li>GammaDEX does not charge a fee.</li>
                            <li>Your role in this transaction is the "maker", i.e. you are adding liquidity to the market.</li>
                        </ul>
                    </div>
                </Alert>
                <img className="user-guide-image" src="/user_guide/order.gif" />
                <p>Orders are placed in the TRADES section at the top of the screen to the left of BIDS AND OFFERS.</p>
                <p>Choose [ BUY ] or [ SELL ]</p>
                <p>Click [ ORDER ]</p>
                <p>Enter a price in units of ETH per token.</p>
                <p>Enter an amount or use the slider.</p>
                <p>Alternatively click on the value next to [ Your TOKEN balance ] or [ Your ETH balance ] to set the maximum possible order amount.</p>
                <p>The total field (in ETH) will change with the amount and can be calculated as price * amount.</p>
                <p>If you do not want your order to expire use the [ Good Till Cancel ] expiry type.</p>
                <p>Alternatively, choose [ Expire After ] and set the relevant number of blocks until expiry.</p>
                <p>The hash is informational and represents your order details in hexadecimal form. Click on [ <i className="fas fa-question-circle"></i> ] to see more details.</p>
                <p>If you are using MetaMask it will prompt you to sign this message hash. Click [ CONFIRM ] in the MetaMask extension.</p>
                <p>Once the order is signed, it is sent to the GammaDEX off-chain order book.</p>
                <p>A blue popup will appear at the bottom left of the screen when your order has been accepted by GammaDEX. It will then appear in the BIDS AND OFFERS section.</p>
            </div>
        )
    }
}

export default Order
