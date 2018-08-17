import React, {Component} from 'react'
import TokenChooser from '../components/TokenChooser'
import TokenStore from '../stores/TokenStore'
import TradeHistory from '../components/TradeHistory'
import * as TokenApi from "../apis/TokenApi"
import UnlistedTokens from "../components/UnlistedTokens"
import AccountDetail from '../components/AccountDetail'
import {withRouter} from "react-router-dom"
import OpenOrdersAndPendingTrades from "../components/OpenOrdersAndPendingTrades"
import PlotlyDepthChart from "../components/OrderBook/PlotlyDepthChart"
import ReactChart from "../components/OrderBook/ReactChart"
import OrderBox from "../components/OrderPlacement/OrderBox"
import OrderBook from "../components/OrderBook"
import Title from "../components/Title"

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
            <div className="exchange">
                <Title token={token}/>

                <div className="row exchange-top">
                    <div className="col-lg-3 exchange-left-col main-col">
                        <AccountDetail token={token}/>
                        <TokenChooser/>
                    </div>
                    <div className="col-lg-3 main-col full-height-lg">
                        <OrderBox token={token}/>
                    </div>
                    <div className="col-lg-3 main-col full-height-lg">
                        <OrderBook token={token}/>
                    </div>
                    <div className="pl-0 col-lg-3 exchange-right-col main-col">
                        <ReactChart/>
                        <PlotlyDepthChart/>
                    </div>
                </div>
                <div className="row exchange-bottom">
                    <div className="col-lg-3 full-height-lg main-col">
                        <UnlistedTokens/>
                    </div>
                    <div className="col-lg-6 full-height-lg main-col">
                        <OpenOrdersAndPendingTrades/>
                    </div>
                    <div className="col-lg-3 full-height-lg main-col">
                        <TradeHistory token={token}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Exchange)