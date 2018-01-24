const $ = require('jquery')
const EtherDeltaWebSocket = require('./etherdelta-web-socket.js')
const tokenSelector = require('./token-selector.js')
const page = require('./page.js')
const model = require("./model-store.js").get()
const configHelper = require('./config-helper.js')

let webSocket = null;

function logEvent(eventMessage) {
    console.log(eventMessage)
    model.events.unshift(eventMessage)
    page.updateEvents()
}

function chooseToken(address) {
    if (webSocket) {
        webSocket.getMarket(address)
    } else {
        console.warn("WebSocket not initialised")
    }
}

function initTokenDropDown() {
    tokenSelector.bind("#tokens", (selection) => {
        const address = selection.target.value
        model.token = {
            'name': configHelper.getTokenName(address),
            'address': address
        }
        page.updateToken()
        chooseToken(address)
    })
}

function start() {
    initTokenDropDown()
    page.updateAll()

    webSocket = new EtherDeltaWebSocket(
        //'wss://socket03.etherdelta.com/socket.io/?transport=websocket',
        'wss://socket.etherdelta.com/socket.io/?transport=websocket',
        (event) => {
            chooseToken(model.token.address)
            logEvent("connected")
        },
        (event) => {
            logEvent("Connection Failed")
        },
        {
            'market': (message) => {
                console.log("market")
                console.log(message)
                const orders = message.orders
                if (orders) {
                    logEvent(`received orders event with ${orders.buys.length} BUYs and ${orders.sells.length} SELLs`)
                    model.orderBook.bidsTable.bids = orders.buys
                    page.updateBids()
                    model.orderBook.offerTable.offers = orders.sells
                    page.updateOffers()
                } else {
                    logEvent("market response did not contain the orderbook, need to retry")
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