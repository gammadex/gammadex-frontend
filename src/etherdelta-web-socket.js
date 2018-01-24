class EtherDeltaWebSocket {
    constructor(address, onOpen, onError, messageHandlers) {
        this.messageHandlers = messageHandlers

        this.socket = new WebSocket(address);
        this.socket.onopen = onOpen
        this.socket.onerror = onError
        this.socket.onmessage = (event) => {
            const data = event.data
            const messageCode = data.slice(0, 2)

            if (messageCode === '42') {
                const payload = JSON.parse(data.slice(2))
                const messageType = payload[0]
                const message = payload[1]
                console.log(`Received message type '${messageType}'`)

                if (this.messageHandlers[messageType]) {
                    this.messageHandlers[messageType](message)
                } else {
                    console.warn(`Unknown message type '${messageType}'. payload: ${payload}`)
                }
            } else {
                console.warn(`Unknown message code '${messageCode}'. data: ${data}`)
            }
        }
    }

    getMarket(tokenAddress, userAddress) {
        const message = {}
        if (tokenAddress) {
            message['tokenAddress'] = tokenAddress
        }
        if (userAddress) {
            message['userAddress'] = userAddress
        }

        const payload = JSON.stringify(message)
        this.socket.send(`42["getMarket",${payload}]`)
    }
}

module.exports = EtherDeltaWebSocket

