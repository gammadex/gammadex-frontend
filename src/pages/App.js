import React, { Component } from 'react'
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
import { Button } from 'reactstrap'
import * as MyTradeActions from "../actions/MyTradeActions"
import MockSocket from "../MockSocket"

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

    purge() {
        MyTradeActions.purge()
        MockSocket.purge()
    }

    render() {
        const { token } = this.state
        const allTokens = Config.getTokens()
        const pageSize = Config.getDefaultPageSize()

        let purge = null
        if (Config.isDevelopment()) {
            purge = <div className="row">
                <div className="col-lg-12">
                    <Button color="link" size="sm" onClick={() => this.purge()}>Purge</Button><small> local storage</small>
                </div>
            </div>
        }

        return (
            <div className="App">
                <small>You are running this application in <b>{Config.getReactEnv()}</b> mode.</small>
                {purge}
                <WebSocketDetail token={token} />
                <TokenChooser token={token} tokenOptions={allTokens} />
                <AccountDetail token={token} />
                <Logout />
                <WalletChooser />
                <OrderPlacement token={token} />
                <OrderBook token={token} pageSize={pageSize} />
                <TradeDetail />
                <MyTrades />
                <GreetingLoginModals />
            </div>
        )
    }
}

export default App
