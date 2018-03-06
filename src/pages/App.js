import React, {Component} from 'react'
import WebSocketDetail from '../components/WebSocketDetail'
import TokenChooser from '../components/TokenChooser'
import AccountDetail from '../components/AccountDetail'
import Logout from '../components/Logout'
import OrderBook from '../components/OrderBook'
import OrderPlacement from '../components/OrderPlacement'
import WalletChooser from '../components/WalletChooser'
import TradeDetail from '../components/TradeDetail'
import MyTrades from '../components/MyTrades'
import TokenStore from '../stores/TokenStore'
import Config from '../Config'
import GreetingLoginModals from "../components/GreetingLoginModals"
import * as TimerActions from "../actions/TimerActions"

class App extends Component {
    constructor() {
        super()
        this.state = {
            token: null,
        }

        this.saveToken = this.saveToken.bind(this)

        // better place for this?
        setInterval(() => {
            TimerActions.timerFired()
        }, 15000)
    }

    componentWillMount() {
        TokenStore.on("change", this.saveToken)
        this.saveToken()
    }

    saveToken() {
        this.setState((prevState, props) => ({
            token: TokenStore.getSelectedToken()
        }))
    }

    render() {
        const {token} = this.state
        const allTokens = Config.getTokens()
        const pageSize = Config.getDefaultPageSize()

        return (
            <div className="App">
                <small>You are running this application in <b>{process.env.NODE_ENV}</b> mode.</small>
                <WebSocketDetail token={token}/>
                <TokenChooser token={token} tokenOptions={allTokens}/>
                <AccountDetail token={token}/>
                <Logout/>
                <WalletChooser/>
                <OrderPlacement token={token}/>
                <OrderBook token={token} pageSize={pageSize}/>
                <TradeDetail/>
                <MyTrades/>
                <GreetingLoginModals/>
            </div>
        )
    }
}

export default App
