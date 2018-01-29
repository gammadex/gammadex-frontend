import _ from "lodash"

class EtherDeltaWebSocket {
    init(address, webSocketProperties, messageHandlers) {
        this.address = address
        this.messageHandlers = messageHandlers
        this.webSocketProperties = webSocketProperties

        this.socket = new WebSocket(this.address)
        _.each(this.webSocketProperties, (val, key) => { // onerror, onopen etc.
            this.socket[key] = val
        })

        this.socket.onmessage = (event) => {
            const data = event.data
            const messageCode = data.slice(0, 2)

            if (messageCode === '42') {
                const payload = JSON.parse(data.slice(2))
                const messageType = payload[0]
                const message = payload[1]
                console.log(`Received message type '${messageType}'`, payload)

                if (this.messageHandlers[messageType]) {
                    this.messageHandlers[messageType](message)
                } else {
                    console.log(`Unknown message type '${messageType}'`)
                }
            } else {
                console.log(`Unknown message code '${messageCode}'`, data)
            }
        }
    }

    getMarket(tokenAddress, userAddress) {
        if (! this.socket) {
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

        const payload = JSON.stringify(message)
        this.socket.send(`42["getMarket",${payload}]`)
    }
}

export default new EtherDeltaWebSocket()