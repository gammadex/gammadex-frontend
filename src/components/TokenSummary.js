import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import Etherscan from "./CustomComponents/Etherscan"

export default class TokenSummary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            trade: 0.011234,
            bid: 0.011234,
            offer: 0.011234,
        }
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveCurrentPrices)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveCurrentPrices)
    }

    saveCurrentPrices = () => {
        this.setState(function (prevState, props) {
        })
    }

    render() {
        const {token} = this.props
        const {trade, bid, offer} = this.state

        if (trade && bid && offer) {
            return (
                <div className="card">
                    <div className="card-header">
                        <h1 className="main-header">{token.name} / ETH</h1>
                    </div>

                    <div className="card-body">
                        <table className="table table-sm token-stats-table">
                            <tbody>
                            <tr>
                                <td>Last Price</td>
                                <td>{trade}</td>
                                <td>24h Change</td>
                                <td>{trade}</td>
                            </tr>
                            <tr>
                                <td>24h High</td>
                                <td>{trade}</td>
                                <td>24h Low</td>
                                <td>{trade}</td>
                            </tr>
                            <tr>
                                <td>24h Vol ETH</td>
                                <td>{trade}</td>
                                <td>24h Vol {token.name}</td>
                                <td>{trade}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        } else {
            return null
        }
    }
}

