import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import TokenStore from '../stores/TokenStore'
import Round from "./CustomComponents/Round"
import EtherScan from "../components/CustomComponents/Etherscan"
import MarketResponseSpinner from "./MarketResponseSpinner"
import {withRouter} from "react-router-dom"
import Conditional from "./CustomComponents/Conditional"
import _ from "lodash"

class TokenStats extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            tradeStats: OrderBookStore.getTradeStats(),
            serverTickers: {},
        }

        this.saveCurrentPrices = this.saveCurrentPrices.bind(this)
        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveCurrentPrices)
        TokenStore.on("change", this.onTokenStoreChange)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveCurrentPrices)
        TokenStore.removeListener("change", this.onTokenStoreChange)
    }

    onTokenStoreChange() {
        this.setState({
            serverTickers: TokenStore.getServerTickers(),
        })
    }

    saveCurrentPrices() {
        this.setState({
            tradeStats: OrderBookStore.getTradeStats()
        })
    }

    render() {
        const path = this.props.location ? this.props.location.pathname : ''
        const inExchange = path.includes('/exchange/')

        const {token} = this.props
        const {serverTickers} = this.state
        const percentChange = token ? _.pick(serverTickers[token.address.toLowerCase()], ['percentChange'])['percentChange'] : 0.0
        const {low, high, tokenVolume, ethVolume, last } = this.state.tradeStats
        const [title, contract, name, longName] = token ? [
            `${token.symbol}/ETH`,
            <EtherScan type="address" address={token.address} display="truncate"/>,
            token.symbol,
            token.name ? token.name : token.symbol
        ] : [
            '', '', '', ''
        ]

        return (
            <Conditional displayCondition={inExchange && !! token}>
                <div className="token-stats">
                    <div className="token-stat-name">24h Volume</div>
                    <div className="token-stat-value"><Round fallback="0">{ethVolume}</Round> ETH (<Round fallback="0">{tokenVolume}</Round> {name})</div>
                </div>

                <div className="token-stats">
                    <div className="token-stat-name">24h High</div>
                    <div className="token-stat-value"><Round price softZeros fallback="0">{high}</Round></div>
                </div>

                <div className="token-stats">
                    <div className="token-stat-name">24h Low</div>
                    <div className="token-stat-value"><Round price softZeros fallback="0">{low}</Round></div>
                </div>

                <div className="token-stats">
                    <div className="token-stat-name">24h Price Change</div>
                    <div className="token-stat-value"><Round percent suffix="%" fallback="0" classNameFunc={(num) => num > 0 ? 'buy-green' : 'sell-red'}>{percentChange}</Round></div>
                </div>
            </Conditional>
        )
    }
}

export default withRouter(TokenStats)