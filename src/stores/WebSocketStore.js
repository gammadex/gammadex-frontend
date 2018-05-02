import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

class WebSocketStore extends EventEmitter {
    constructor() {
        super()
        this.url = null
        this.connecting = false
        this.connected = false
    }

    getConnectionState() {
        return {
            url: this.url,
            connected: this.connected,
            connecting: this.connecting,
        }
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
        }
    }
}

const webSocketStore = new WebSocketStore()
dispatcher.register(webSocketStore.handleActions.bind(webSocketStore))

export default webSocketStore