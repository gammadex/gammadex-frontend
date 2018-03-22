import React, {Component} from 'react'
import TokenChooser from '../components/TokenChooser'
import OrderBook from '../components/OrderBook'
import OrderPlacement from '../components/OrderPlacement'
import TradeDetail from '../components/TradeDetail'
import OpenOrders from '../components/OpenOrders'
import TokenStore from '../stores/TokenStore'
import TradeHistory from '../components/TradeHistory'
import Charts from '../components/Charts'
import AccountDetail from '../components/AccountDetail'
import TokenErrorMessage from '../components/TokenErrorMessage'
import * as TokenApi from "../apis/TokenApi"

class Exchange extends Component {
    constructor() {
        super()
        this.state = {
            token: null,
            invalidTokenIdentifier: null,
        }

        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
    }

    componentDidUpdate(prevProps) {
        TokenApi.ensureCorrectToken(prevProps, this.props, this.state.token, this.state.invalidTokenIdentifier)
    }

    componentWillMount() {
        TokenApi.ensureCorrectToken(null, this.props, this.state.token, this.state.invalidTokenIdentifier)

        TokenStore.on("change", this.onTokenStoreChange)
        this.onTokenStoreChange()
    }

    componentWillUnmount() {
        TokenStore.removeListener("change", this.onTokenStoreChange)
    }

    onTokenStoreChange() {
        this.setState((prevState, props) => ({
            token: TokenStore.getSelectedToken(),
            invalidTokenIdentifier: TokenStore.getInvalidTokenIdentifier(),
        }))
    }

    render() {
        const {token, invalidTokenIdentifier} = this.state

        return <div className="row">
            <div className="col-lg-3">
                <OrderBook token={token}/>
            </div>
            <div className="pl-0 col-lg-6 ">
                <TokenErrorMessage invalidToken={invalidTokenIdentifier}/>
                <Charts token={token}/>
                <OrderPlacement token={token}/>
                <TradeDetail/>
                <OpenOrders/>
                <TradeHistory token={token}/>
            </div>
            <div className="pl-0 col-lg-3">
                <TokenChooser/>
                <AccountDetail token={token}/>
            </div>
        </div>
    }
}

export default Exchange
