import React, {Component} from 'react'
import TokenChooser from '../components/TokenChooser'
import OrderBook from '../components/OrderBook'
import OrderPlacement from '../components/OrderPlacement'
import TradeDetail from '../components/TradeDetail'
import OpenOrders from '../components/OpenOrders'
import MyTrades from '../components/MyTrades'
import TokenStore from '../stores/TokenStore'
import TradeHistory from '../components/TradeHistory'
import Charts from '../components/Charts'
import AccountDetail from '../components/AccountDetail'
import * as TokenApi from "../apis/TokenApi"

class Exchange extends Component {
    constructor() {
        super()
        this.state = {
            token: null,
        }

        this.saveToken = this.saveToken.bind(this)
    }

    getUrlTokenFromProps(props) {
        return (props && props.match && props.match.params && props.match.params[0]) ? props.match.params[0] : null
    }

    ensureCorrectToken(prevProps) {
        const prevUrlToken = this.getUrlTokenFromProps(prevProps)
        const currUrlToken = this.getUrlTokenFromProps(this.props)

        if (prevUrlToken && prevUrlToken !== currUrlToken) {
            TokenApi.selectTokenInUrlIfNotCurrentToken(currUrlToken, this.state.token)
        }
    }

    componentDidUpdate(prevProps) {
        this.ensureCorrectToken(prevProps)
    }

    componentWillMount() {
        this.ensureCorrectToken()

        TokenStore.on("change", this.saveToken)
        this.saveToken()
    }

    componentWillUnmount() {
        TokenStore.removeListener("change", this.saveToken)
    }

    saveToken() {
        this.setState((prevState, props) => ({
            token: TokenStore.getSelectedToken()
        }))
    }

    render() {
        const {token} = this.state

        return <div className="row">
            <div className="col-lg-3">
                <OrderBook token={token}/>
            </div>
            <div className="pl-0 col-lg-6 ">
                <Charts token={token}/>
                <OrderPlacement token={token}/>
                <TradeDetail/>
                <OpenOrders/>
                <TradeHistory token={token}/>
                <MyTrades/>
            </div>
            <div className="pl-0 col-lg-3">
                <TokenChooser/>
                <AccountDetail token={token}/>
            </div>
        </div>
    }
}

export default Exchange
