import React from "react"
import 'react-select/dist/react-select.css'
import WebSocketStore from './stores/WebSocketStore'
import TokenStore from './stores/TokenStore'

/**
 * TODO - not sure this class needs to exist
 *
 * The change handlers should possibly be in a store
 */
class LifecycleEventHandler {
    constructor() {
        this.onConfigChange = this.onConfigChange.bind(this)
        this.onTokenSelected = this.onTokenSelected.bind(this)

        TokenStore.on("change", this.onTokenSelected)
    }

    start() {
    }

    onConfigChange() {
        //WebSocketActions.connect()
    }

    onTokenSelected() {
        if (WebSocketStore.isConnnected()) {
            // TODO - EtherDeltaWebSocket should not be a property of WebSocketStore
            WebSocketStore.getEtherDeltaWebSocket().getMarket(TokenStore.getSelectedToken().address)
        }
    }
}

export default new LifecycleEventHandler()
