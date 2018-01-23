const $ = require('jquery')
const EtherDeltaWebSocket = require('./etherdelta-web-socket.js')
const tokenSelector = require('./token-selector.js')
const page = require('./page.js')

let webSocket = null;

function loadMarket(address) {
    if (webSocket) {
        page.choseTokenByAddress(address)
        webSocket.getMarket(address)
    } else {
        console.warn("WebSocket not initialised")
    }
}

function initTokenDropDown() {
    tokenSelector.bind("#tokens", (selection) => loadMarket(selection.target.value))
}

function start() {
    webSocket = new EtherDeltaWebSocket(
        'wss://socket04.etherdelta.com/socket.io/?transport=websocket',
        (event) => {
            page.logEvent(`connected`)
            initTokenDropDown();
        },
        (event) => {
            page.logEvent(`connection failed`)
        },
        {
            'market': (message) => {
                const orders = message.orders
                if (orders) {
                    page.logEvent(`received orders event with ${orders.buys.length} BUYs and ${orders.sells.length} SELLs`)
                    page.setBidOrders(orders.buys.slice(0, 10))
                    page.setAskOrders(orders.sells.slice(0, 10))
                } else {
                    page.logEvent("market response did not contain the orderbook, need to retry")
                }
            },
            'orders': (message) => {
                console.log(`orders update:`)
                console.log(message)
            }
        }
    )
}

module.exports = {
    'start': start
}