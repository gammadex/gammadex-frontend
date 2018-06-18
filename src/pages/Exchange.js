import React, {Component} from 'react'
import TokenChooser from '../components/TokenChooser'
import TokenSummary from '../components/TokenSummary'
import OpenOrders from '../components/OpenOrders'
import TokenStore from '../stores/TokenStore'
import TradeHistory from '../components/TradeHistory'
import Charts from '../components/Charts'
import * as TokenApi from "../apis/TokenApi"
import BrowserWeb3Warning from "../components/BrowserWeb3Warning"
import UnlistedTokens from "../components/UnlistedTokens"
import Trading from "../components/Trading"
import PendingTrades from "../components/PendingTrades"
import AccountDetail from '../components/AccountDetail'
import UnrecognisedToken from "../components/UnrecognisedToken"
import {withRouter} from "react-router-dom"

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

        return <div>
            <div className="row">
                <div className="col-lg-3">
                    <TokenSummary token={token}/>
                    <TokenChooser/>
                    <UnlistedTokens/>
                </div>
                <div className="pl-0 col-lg-6 ">
                    <UnrecognisedToken />
                    <BrowserWeb3Warning/>
                    <Trading token={token}/>
                    <OpenOrders/>
                </div>
                <div className="pl-0 col-lg-3">
                    <Charts token={token}/>
                    <AccountDetail token={token} />
                    <PendingTrades/>
                    <TradeHistory token={token}/>
                </div>
            </div>
        </div>
    }
}

export default withRouter(Exchange)