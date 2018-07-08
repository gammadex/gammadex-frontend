import React, { Component } from 'react'
import ReactChart from "../components/OrderBook/ReactChart"
import TokenChooser from "../components/TokenChooser"
import * as TokenActions from "../actions/TokenActions"
import TokenStore from "../stores/TokenStore"
import TokenRepository from "../util/TokenRepository"
import * as WebSocketActions from "../actions/WebSocketActions"

class Chart extends Component {

    onTokenSelect = (tokenName) => {
        const token = TokenRepository.getTokenBySymbolOrAddress(tokenName)
        TokenActions.selectToken(token)
        WebSocketActions.getMarket()
    }

    render() {
        return (
            <div className="row">
                <div className="col-lg-3 exchange-left-col main-col">
                    <TokenChooser onTokenSelectOverride={this.onTokenSelect} />
                </div>
                <div className="pl-0 col-lg-6 exchange-middle-col main-col full-height">
                    <ReactChart />
                </div>
            </div>
        )
    }
}

export default Chart
