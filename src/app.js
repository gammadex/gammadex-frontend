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
            logEvent(`connected`)
            initTokenDropDown();
        },
        (event) => {
            log.error("failed to connect")
            logEvent(`connection failed`)
        },
        {
            'market': (message) => {
                const orders = message.orders
                if (orders) {
                    logEvent(`received orders event with ${orders.buys.length} BUYs and ${orders.sells.length} SELLs`)
                    addOrdersToBidTableRow(orders.buys.slice(0, 10))
                    addOrdersToAskTableRow(orders.sells.slice(0, 10))
                } else {
                    console.log("market response did not contain the orderbook, need to retry")
                    logEvent(`order book initial snapshot not received, please reload page`)
                }
            },
            'orders': (message) => {
                console.log(`orders update:`)
                console.log(message)
            }
        }
    )
}

function addOrdersToBidTableRow(orders) {
    const tbody = $('#bids').find('tbody:last-child')
    $(tbody).empty();
    orders.forEach(order => {
        const row = `<tr><td>${order.user}</td><td>${order.ethAvailableVolumeBase}</td><td>${order.ethAvailableVolume}</td><td>${order.price}</td></tr>`
        tbody.append(row)
    })
}

function addOrdersToAskTableRow(orders) {
    const row = `<tr><td>${order.user}</td><td>${order.ethAvailableVolume}</td><td>${order.ethAvailableVolumeBase}</td><td>${order.price}</td></tr>`
    const tbody = $('#offers').find('tbody:last-child')
}

function logEvent(event) {
    $('#events').find('> tbody:last-child').append(`<tr><td>${event}</td></tr>`);
}

module.exports = {
    'start': start
}