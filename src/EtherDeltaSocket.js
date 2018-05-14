import _ from "lodash"
import io from 'socket.io-client'

class EtherDeltaWebSocket {
    init(url, socketEventHandlers, messageHandlers) {
        this.socket = io(url, { transports: ['websocket'], autoConnect: false })

        const handlers = Object.assign({}, socketEventHandlers, messageHandlers)

        _.each(handlers, (handler, eventName) => {
            this.socket.on(eventName, (response) => {
                console.log(`Received ${eventName}`, response)
                handler(response)
            })
        })

        this.socket.open()
        this.emitOrder = this.emitOrder.bind(this)
    }

    getMarket(tokenAddress, userAddress) {
        if (!this.socket) {
            console.warn("Can't request market - not connected")
            return
        }

        console.log(`Requesting market for token: ${tokenAddress}, user: ${userAddress}`)

        const message = {}
        if (tokenAddress) {
            message['token'] = tokenAddress
        }
        if (userAddress) {
            message['user'] = userAddress
        }

        this.socket.emit('getMarket', message)
    }

    emitOrder(order) {
        const self = this
        return new Promise(function (resolve, reject) {
            self.socket.emit('message', order)
            self.socket.once('messageResult', (messageResult) => {
                resolve(messageResult)
            })
        })
    }
}

export default new EtherDeltaWebSocket()