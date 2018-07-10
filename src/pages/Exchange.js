import React, {Component} from 'react'
import TokenChooser from '../components/TokenChooser'
import TokenStore from '../stores/TokenStore'
import TradeHistory from '../components/TradeHistory'
import * as TokenApi from "../apis/TokenApi"
import UnlistedTokens from "../components/UnlistedTokens"
import Trading from "../components/Trading"
import AccountDetail from '../components/AccountDetail'
import {withRouter} from "react-router-dom"
import OpenOrdersAndPendingTrades from "../components/OpenOrdersAndPendingTrades"
import PlotlyPriceChart from "../components/OrderBook/PlotlyPriceChart"
import PlotlyDepthChart from "../components/OrderBook/PlotlyDepthChart"

class Exchange extends Component {
    constructor() {
        super()
        this.state = {
            token: null,
        }

        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
    }

    componentDidUpdate(prevProps) {
        TokenApi.ensureCorrectToken(prevProps, this.props, this.state.token)
    }

    componentWillMount() {
        TokenApi.ensureCorrectToken(null, this.props, this.state.token)

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

    render() {
        const {token} = this.state

        return (
            <div className="row">
                <div className="col-lg-3 exchange-left-col main-col">
                    <AccountDetail token={token}/>
                    <TokenChooser/>
                    <UnlistedTokens/>
                </div>
                <div className="pl-0 col-lg-6 exchange-middle-col main-col full-height">
                    <Trading token={token}/>
                    <OpenOrdersAndPendingTrades/>
                </div>
                <div className="pl-0 col-lg-3 exchange-right-col main-col">
                    <PlotlyPriceChart token={token}/>
                    <PlotlyDepthChart/>
                    <TradeHistory token={token}/>
                </div>
            </div>
        )
    }
}

export default withRouter(Exchange)