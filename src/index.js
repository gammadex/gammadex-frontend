import React from 'react'
import ReactDOM from 'react-dom'
import App from './pages/App.js'
import * as ApplicationBootstrapper from "./util/ApplicationBootstrapper"
import * as WalletApi from "./apis/WalletApi"
import * as GasApi from "./apis/GasApi"
import * as AccountApi from "./apis/AccountApi"
import * as WebSocketActions from "./actions/WebSocketActions"
import * as MyTradeApi from "./apis/MyTradeApi"
import * as BlockApi from "./apis/BlockApi"

global.FontAwesomeConfig = { autoReplaceSvg: 'nest' }

ReactDOM.render(<App />, document.getElementById('app'), () => {
    ApplicationBootstrapper.initAccounts().then((accountInitialised) => {
        WalletApi.startMetaMaskCheckLoop()
        GasApi.startGasStationPollLoop()
        GasApi.startCoinMarketCapPollLoop()
        AccountApi.startPendingTransferCheckLoop()
        AccountApi.startEthAndTokBalanceRefreshLoop()
        MyTradeApi.startPendingTradesCheckLoop()
        WebSocketActions.connect()
        BlockApi.startCurrentBlockNumberCheckLoop()
    })
})
