import React from 'react'
import ReactDOM from 'react-dom'
import App from './pages/App.js'
import * as ApplicationBootstrapper from "./util/BootstrapAccount"

ReactDOM.render(<App />, document.getElementById('app'), () => {
    ApplicationBootstrapper.initAccounts()
})
