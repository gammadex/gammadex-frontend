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
    }

    isTruncated(str) {
        return str && str.startsWith('0x') && str.includes('...')
    }

    hideTruncated(str) {
        return this.isTruncated(str) ? "" : str
    }

    render() {
        const path = this.props.location ? this.props.location.pathname : ''
        const inExchange = path.includes('/exchange/')

        const {token} = this.props
        const [title, contract, name, longName] = token ? [
            `${token.symbol}/ETH`,
            <EtherScan type="address" address={token.address} display="truncate"/>,
            this.hideTruncated(token.symbol),
            token.name ? this.hideTruncated(token.name) : this.hideTruncated(token.symbol)
        ] : [
            '', '', '', ''
        ]

        return (
            <Conditional displayCondition={inExchange && !! token}>
                <div className="token-summary">
                    <div className="token-title">
                        {title}
                    </div>
                </div>
            </Conditional>
        )
    }
}

export default withRouter(TokenSummary)