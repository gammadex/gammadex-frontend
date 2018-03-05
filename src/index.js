import React from 'react'
import ReactDOM from 'react-dom'
import App from './pages/App.js'
import * as ApplicationBootstrapper from "./util/ApplicationBootstrapper"
import * as WalletApi from "./apis/WalletApi"

ReactDOM.render(<App />, document.getElementById('app'), () => {
    ApplicationBootstrapper.initAccounts()
    WalletApi.startMetaMaskCheckLoop()
})
