import _ from "lodash"
import io from 'socket.io-client'

class EtherDeltaWebSocket {
    init(url, socketEventHandlers, messageHandlers) {
        this.socket = io(url, {transports: ['websocket'], autoConnect: false});

        const handlers = Object.assign({}, socketEventHandlers, messageHandlers)

        _.each(handlers, (handler, eventName) => {
            this.socket.on(eventName, (response) => {
                console.log(`Received ${eventName}`, response)
                handler(response)
            })
        })

        this.socket.open()
    }

    getMarket(tokenAddress, userAddress) {
        if (!this.socket) {
            console.warn("Can't request market - not connected")
            return
        }

        console.log(`Requesting market ${tokenAddress}`)

        const message = {}
        if (tokenAddress) {
            message['token'] = tokenAddress
        }
        if (userAddress) {
            message['user'] = userAddress
        }

        this.socket.emit('getMarket', message)
    }
}

export default new EtherDeltaWebSocket()