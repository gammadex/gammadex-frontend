import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import Round from "./CustomComponents/Round"
import EtherScan from "../components/CustomComponents/Etherscan"
import MarketResponseSpinner from "./MarketResponseSpinner"
import {withRouter} from "react-router-dom"
import Conditional from "./CustomComponents/Conditional"
import TokenStats from "./TokenStats"

class TokenSummary extends React.Component {
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
        const path = this.props.location ? this.props.location.pathname : ''
        const inExchange = path.includes('/exchange/')

        const {token} = this.props
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
                <div className="token-summary">
                    <div className="token-title">
                        {title}
                    </div>
                    <div className="token-info" style={{"margin-left": "10px"}}>
                        <div>{longName}</div>
                        <div>{name} smart contract: {contract}</div>
                    </div>
                </div>
            </Conditional>
        )
    }
}

export default withRouter(TokenSummary)