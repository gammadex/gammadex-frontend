import React, { Component } from 'react'
import ReactChart from "../components/OrderBook/ReactChart"
import TokenChooser from "../components/TokenChooser"
import * as TokenActions from "../actions/TokenActions"
import TokenRepository from "../util/TokenRepository"
import * as WebSocketActions from "../actions/WebSocketActions"
import TokenStore from '../stores/TokenStore'
import TradeHistory from '../components/TradeHistory'

class Chart extends Component {
    constructor() {
        super()
        this.state = {
            token: null,
        }

        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
    }

    componentWillMount() {
        TokenStore.on("change", this.onTokenStoreChange)
        this.onTokenStoreChange()
    }

    componentWillUnmount() {
        TokenStore.removeListener("change", this.onTokenStoreChange)
    }

    onTokenStoreChange() {
        this.setState((prevState, props) => ({
            token: TokenStore.getSelectedToken(),
        }))
    }
    onTokenSelect = (tokenName) => {
        const token = TokenRepository.getTokenBySymbolOrAddress(tokenName)
        TokenActions.selectToken(token)
        WebSocketActions.getMarket()
    }

    render() {
        const {token} = this.state
        return (
            <div className="row">
                <div className="col-lg-3 exchange-left-col main-col">
                    <TokenChooser onTokenSelectOverride={this.onTokenSelect} />
                </div>
                <div className="pl-0 col-lg-6 exchange-middle-col main-col full-height">
                    <ReactChart />
                </div>
                <div className="pl-0 col-lg-3 exchange-right-col main-col">
                    <TradeHistory token={token}/>
                </div>                
            </div>
        )
    }
}

export default Chart
