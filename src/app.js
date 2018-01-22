const _ = require('lodash')
const $ = require('jquery')

const socketAddress = 'wss://socket.etherdelta.com/socket.io/?transport=websocket'
const socket = new WebSocket(socketAddress);

function getMarket() {
    console.log("calling getMarket")
    // 0x8f3470a7388c05ee4e7af3d01d8c722b0ff52374 = VERI
    // (see https://github.com/etherdelta/etherdelta.github.io/blob/master/config/main.json)
    socket.send(`42["getMarket",{"token":"0x8f3470a7388c05ee4e7af3d01d8c722b0ff52374"}]`)
}

function start() {
    setMessage(`connecting to ${socketAddress}...`)
    
    socket.onopen = function (event) {
        setMessage(`connected to ${socketAddress}`)
        getMarket();
    };

    socket.onerror = function () {
        setMessage(`connection to ${socketAddress} FAILED`)
    };

    socket.onmessage = function (event) {
        const message = event.data;

        if(message.slice(0,2) === '42') {
            const payload = JSON.parse(message.slice(2))
            console.log(`on message 42: ${payload[0]}`)
            if(payload[0] === "market") {
                const orders = payload[1].orders
                if(orders) {
                    setEvent(`received orders event with ${orders.buys.length} BUYs and ${orders.sells.length} SELLs`)
                    console.log(orders.buys[0])
                    console.log(orders.sells[0])
                    const tables = `${bidTable(orders.buys.slice(0,10))}${askTable(orders.sells.slice(0,10))}`
                    document.getElementById('table').innerHTML = tables;
                } else {
                    console.log("market response did not contain the orderbook, need to retry")
                    setEvent(`order book initial snapshot not received, please reload page`);
                }
            }
            else if(payload[0] === "orders") {
                console.log(`orders update:`)
                console.log(payload[1])
            }
        } else {
            console.log(`on message: ${message}`)
        }
    };
}

function bidTable(bidOrders) {
    return `<table border=1 class="inlineTable"><caption>BIDS</caption>${bidHeader()}${bidOrders.map(orderToBidTableRow).join(" ")}</table>`
}

function bidHeader() {
    return `<tr><td>USER</td><td>TOTAL (ETH)</td><td>SIZE (VERI)</td><td>BID (ETH)</td></tr>`
}

function orderToBidTableRow(order) {
    return `<tr><td>${order.user}</td><td>${order.ethAvailableVolumeBase}</td><td>${order.ethAvailableVolume}</td><td>${order.price}</td></tr>`
}

function askTable(askOrders) {
    return `<table border=1 class="inlineTable"><caption>ASKS</caption>${askHeader()}${askOrders.map(orderToAskTableRow).join(" ")}</table>`
}

function askHeader() {
    return `<tr><td>ASK (ETH)</td><td>SIZE (VERI)</td><td>TOTAL (ETH)</td><td>USER</td></tr>`
}

function orderToAskTableRow(order) {
    return `<tr><td>${order.price}</td><td>${order.ethAvailableVolume}</td><td>${order.ethAvailableVolumeBase}</td<td>${order.user}</td></tr>`
}

function setMessage(message) {
    $('#message')[0].innerText = message
}

function setEvent(event) {
    $('#event')[0].innerText = event
}
module.exports = {
    'start': start,
    'setMessage': setMessage,
    'setEvent': setEvent,
}