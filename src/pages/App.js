import React, {Component} from 'react'
import WebSocketDetail from '../components/WebSocketDetail'
import TokenChooser from '../components/TokenChooser'
import AccountDetail from '../components/AccountDetail'
import OrderBook from '../components/OrderBook'
import OrderPlacement from '../components/OrderPlacement'
import WalletChooser from '../components/WalletChooser'
import TradeDetail from '../components/TradeDetail'
import TokenStore from '../stores/TokenStore'
import Config from '../Config'
import GreetingLoginModals from "../components/GreetingLoginModals"

class App extends Component {
    constructor() {
        super()
        this.state = {
            token: null,
        }

        this.saveToken = this.saveToken.bind(this)
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
                <WalletChooser/>
                <OrderPlacement token={token}/>
                <OrderBook token={token} pageSize={pageSize}/>
                <TradeDetail/>
                <GreetingLoginModals/>
            </div>
        )
    }
}

export default App
