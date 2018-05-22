import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import Round from "./CustomComponents/Round"
import Config from "../Config"
import EtherScan from "../components/CustomComponents/Etherscan"
import _ from "lodash"

export default class TokenSummary extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            tradeStats: OrderBookStore.getTradeStats()
        }

        this.saveCurrentPrices = this.saveCurrentPrices.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveCurrentPrices)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveCurrentPrices)
    }

    saveCurrentPrices() {
        this.setState({
            tradeStats: OrderBookStore.getTradeStats()
        })
    }

    render() {tokenAddress
        const {token} = this.props
        const {low, high, tokenVolume, ethVolume, last, percentChange, tokenAddress} = this.state.tradeStats

        if (tokenAddress && token.address && tokenAddress.toLowerCase() && token.address.toLowerCase()) {
            console.log(tokenAddress.toLowerCase(),token.address.toLowerCase(),  tokenAddress.toLowerCase()===token.address.toLowerCase(), last)

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
                                <td><Round price softZeros>{last}</Round></td>
                                <td>24h Change</td>
                                <td><Round percent softZeros>{percentChange}</Round>%</td>
                            </tr>
                            <tr>
                                <td>24h High</td>
                                <td><Round price softZeros>{high}</Round></td>
                                <td>24h Low</td>
                                <td><Round price softZeros>{low}</Round></td>
                            </tr>
                            <tr>
                                <td>24h Vol ETH</td>
                                <td><Round>{ethVolume}</Round></td>
                                <td>24h Vol {token.name}</td>
                                <td><Round>{tokenVolume}</Round></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="card-footer">
                        <strong>{token.lName !== undefined ? token.lName : token.name}</strong> contract: <EtherScan type="address" address={token.address} display="truncate"/>
                    </div>
                </div>
            )
        } else {
            return null
        }
    }
}

