import _ from "lodash"
import io from 'socket.io-client'
import Config from './Config'

class EtherDeltaWebSocket {
    init(url, socketEventHandlers, messageHandlers) {
        this.socket = io(url, { transports: ['websocket'], autoConnect: false })

        const handlers = Object.assign({}, socketEventHandlers, messageHandlers)

        _.each(handlers, (handler, eventName) => {
            this.socket.on(eventName, (response) => {
                console.log(`Received ${eventName}`, response)
                if (true || Config.isDevelopment()) {
                    global.messages = global.messages || {}
                    global.messages[eventName] = response
                }
                handler(response)
            })
        })

        this.socket.open()
        this.emitOrder = this.emitOrder.bind(this)
    }

    getMarket(tokenAddress, userAddress, cachedTokensVersion = null) {
        if (!this.socket) {
            console.warn("Can't request market - not connected")
            return
        }

        const message = {}
        if (tokenAddress) {
            message['token'] = tokenAddress
        }
        if (userAddress) {
            message['user'] = userAddress
        }
        if (cachedTokensVersion != null) {
            message['tokensVersion'] = cachedTokensVersion
        }

        console.log(`Requesting market for token: ${tokenAddress}, user: ${userAddress}, tokensVersion: ${cachedTokensVersion}`, message)

        this.socket.emit('getMarket', message)
    }

    getTokens() {
        console.log("Requesting list of tokens")

        this.socket.emit('getTokens', {})
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