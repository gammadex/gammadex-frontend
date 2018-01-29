import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

class WebSocketStore extends EventEmitter {
    constructor() {
        super()
        this.etherDeltaWebSocket = null
        this.url = null
        this.connecting = false
        this.connected = false
        this.requestedToken = null
    }

    getEtherDeltaWebSocket() {
        return this.etherDeltaWebSocket
    }

    getConnectionState() {
        return {
            url: this.url,
            connected: this.connected,
            connecting: this.connecting,
            requestedToken: this.requestedToken
        }
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.WEB_SOCKET_CONSTRUCTED: {
                this.url = action.url
                this.etherDeltaWebSocket = action.etherDeltaWebSocket
                this.connected = false
                this.connecting = true
                this.emitChange()
                break;
            }
            case ActionNames.WEB_SOCKET_OPENED: {
                console.log("WebSocket opened")
                this.url = action.url
                this.etherDeltaWebSocket = action.etherDeltaWebSocket
                this.connected = true
                this.connecting = false
                this.emitChange()
                break
            }
            case ActionNames.WEB_SOCKET_CLOSED: {
                console.log("WebSocket closed")
                this.url = null
                this.etherDeltaWebSocket = null
                this.connected = false
                this.connecting = false
                this.requestedToken = null
                this.emitChange()
                break
            }
            case ActionNames.SELECT_TOKEN: {
                const {token} = action

                if (this.etherDeltaWebSocket) {
                    console.log(`Getting market for `, token)
                    this.etherDeltaWebSocket.getMarket(token.address)
                } else {
                    // TODO - reconnect
                    console.log("No websocket - can't get market")
                }

                this.emitChange()
                break
            }
        }
    }
}

const webSocketStore = new WebSocketStore()
dispatcher.register(webSocketStore.handleActions.bind(webSocketStore))

export default webSocketStore