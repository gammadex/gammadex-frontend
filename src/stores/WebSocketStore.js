import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

class WebSocketStore extends EventEmitter {
    constructor() {
        super()
        this.url = null
        this.connecting = false
        this.connected = false
        this.marketResponseReceived = false
    }

    getConnectionState() {
        return {
            url: this.url,
            connected: this.connected,
            connecting: this.connecting,
            marketResponseReceived: this.marketResponseReceived
        }
    }

    isMarketResponseReceived() {
        return this.marketResponseReceived
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.WEB_SOCKET_CONSTRUCTED: {
                this.url = action.url
                this.connected = false
                this.connecting = true
                this.emitChange()
                break
            }
            case ActionNames.WEB_SOCKET_OPENED: {
                console.log("WebSocket opened")
                this.url = action.url
                this.connected = true
                this.connecting = false
                this.emitChange()
                break
            }
            case ActionNames.WEB_SOCKET_CLOSED: {
                console.log("WebSocket closed")
                this.url = null
                this.connected = false
                this.connecting = false
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_REQUESTED_MARKET: {
                this.marketResponseReceived = false
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_MARKET: {
                this.marketResponseReceived = true
                this.emitChange()
                break
            }
        }
    }
}

const webSocketStore = new WebSocketStore()
dispatcher.register(webSocketStore.handleActions.bind(webSocketStore))

export default webSocketStore