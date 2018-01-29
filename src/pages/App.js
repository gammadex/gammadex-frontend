import React, {Component} from 'react'
import WebSocketDetail from '../components/WebSocketDetail'
import TokenChooser from '../components/TokenChooser'
import OrderBook from '../components/OrderBook'
import TokenStore from '../stores/TokenStore'
import Config from '../Config'

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

        return (
            <div className="App">
                <WebSocketDetail token={token}/>
                <TokenChooser token={token} tokenOptions={allTokens}/>
                <OrderBook token={token}/>
            </div>
        )
    }
}

export default App
