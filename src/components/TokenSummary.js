import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import Round from "./CustomComponents/Round"
import EtherScan from "../components/CustomComponents/Etherscan"

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

    render() {
        const {token} = this.props
        const {low, high, tokenVolume, ethVolume, last, percentChange} = this.state.tradeStats
        const [title, contract, name, longName] = token ? [
            `${token.name} / ETH`,
            <EtherScan type="address" address={token.address} display="truncate"/>,
            token.name,
            token.lName ? token.lName : token.name
        ] : [
            '', '', '', ''
        ]

        return (
            <div className="card">
                <div className="card-header">
                    <h1 className="main-header">{title}</h1>
                </div>

                <div className="card-body">
                    <table className="table table-sm token-stats-table">
                        <tbody>
                        <tr>
                            <td>Last Price</td>
                            <td><Round price softZeros fallback="-">{last}</Round></td>
                            <td>24h Change</td>
                            <td><Round percent suffix="%" fallback="-"
                                       classNameFunc={(num) => num > 0 ? 'buy-green' : 'sell-red'}>{percentChange}</Round>
                            </td>
                        </tr>
                        <tr>
                            <td>24h High</td>
                            <td><Round price softZeros fallback="-">{high}</Round></td>
                            <td>24h Low</td>
                            <td><Round price softZeros fallback="-">{low}</Round></td>
                        </tr>
                        <tr>
                            <td>24h Vol ETH</td>
                            <td><Round fallback="-">{ethVolume}</Round></td>
                            <td>24h Vol {name}</td>
                            <td><Round fallback="-">{tokenVolume}</Round></td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <div className="card-footer">
                    <strong>{longName}</strong> contract: {contract}
                </div>
            </div>
        )
    }
}

