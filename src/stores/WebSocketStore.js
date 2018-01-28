import {EventEmitter} from "events";
import dispatcher from "../dispatcher";
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

    isConnnected() {
        return this.connected
    }

    getEtherDeltaWebSocket() {
        return this.etherDeltaWebSocket
    }

    getConnectionState() {
        return {
            url: this.url,
            connected: this.connected,
            requestedToken: this.requestedToken
        }
    }

    emitChange() {
        this.emit("change");
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.WEB_SOCKET_OPENED: {
                console.log("WebSocket opened")
                this.url = action.url
                this.etherDeltaWebSocket = action.etherDeltaWebSocket
                this.connected = true
                this.emitChange()
                break;
            }
            case ActionNames.WEB_SOCKET_CLOSED: {
                console.log("WebSocket closed")
                this.url = null
                this.etherDeltaWebSocket = null
                this.connected = false
                this.requestedToken = null
                this.emitChange()
                break;
            }
        }
    }
}

const webSocketStore = new WebSocketStore();
dispatcher.register(webSocketStore.handleActions.bind(webSocketStore));

export default webSocketStore;