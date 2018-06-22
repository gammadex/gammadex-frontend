import React, {Component} from 'react'
import TokenChooser from '../components/TokenChooser'
import OpenOrders from '../components/OpenOrders'
import TokenStore from '../stores/TokenStore'
import TradeHistory from '../components/TradeHistory'
import Charts from '../components/Charts'
import * as TokenApi from "../apis/TokenApi"
import UnlistedTokens from "../components/UnlistedTokens"
import Trading from "../components/Trading"
import PendingTrades from "../components/PendingTrades"
import AccountDetail from '../components/AccountDetail'
import UnrecognisedToken from "../components/UnrecognisedToken"
import {withRouter} from "react-router-dom"
import InvalidUrlTokenWarning from "../components/InvalidUrlTokenWarning"

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
                <div className="col-lg-3 exchange-left-col">
                    <AccountDetail token={token}/>
                    <TokenChooser/>
                    <UnlistedTokens/>
                </div>
                <div className="pl-0 col-lg-6 exchange-middle-col">
                    <UnrecognisedToken/>
                    <InvalidUrlTokenWarning/>
                    <Trading token={token}/>
                    <OpenOrders/>
                    <PendingTrades/>
                </div>
                <div className="pl-0 col-lg-3 exchange-right-col">
                    <Charts token={token}/>
                    <TradeHistory token={token}/>
                </div>
            </div>
        )
    }
}

export default withRouter(Exchange)