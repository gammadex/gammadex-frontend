import React from "react"
import WebSocketStore from '../stores/WebSocketStore'
import TokenStore from '../stores/TokenStore' // TODO for mocking only, delete!
import * as WebSocketActions from "../actions/WebSocketActions"
import * as MockWebSocketActions from "../actions/MockWebSocketActions"

export default class WebSocketDetail extends React.Component {
    constructor() {
        super()
        this.state = {
            url: null,
            connecting: false,
            connected: false
        }
    }

    componentWillMount() {
        WebSocketStore.on("change", this.saveConnectionState)
    }

    saveConnectionState = () => {
        this.setState(WebSocketStore.getConnectionState())
    }

    connectToWebSocket() {
        // ouch, delete
        if(TokenStore.getSelectedToken().name==="TST") {
            MockWebSocketActions.connect()
        } else {
            WebSocketActions.connect()
        }
    }

    render() {
        const {url, connecting, connected} = this.state

        let status = <span><span className="text-danger">No connection  </span> <button className="btn" onClick={this.connectToWebSocket}>Connect</button></span>
        if (connecting) {
            status = <span className="text-warning">Connecting to {url}</span>
        } else if (connected) {
            status = <span className="text-success">Connected to {url}</span>
        }

        return (
            <div className="row">
                <div className="col-lg-12">
                    Websocket status: {status}
                </div>
            </div>
        )
    }
}
