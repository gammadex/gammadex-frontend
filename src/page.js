const configHelper = require('./config-helper.js')
const $ = require('jquery')

function choseTokenByAddress(address) {
    const tokenName = configHelper.getTokenName(address)

    $('#bidsToken')[0].innerText = tokenName
    $('#offersToken')[0].innerText = tokenName
}

function logEvent(eventMessage) {
    console.log(eventMessage)
    $('#events').find('> tbody:last-child').append(`<tr><td>${eventMessage}</td></tr>`);
}

function setBidOrders(orders) {
    _setOrderRows('#bids', orders)
}

function setAskOrders(orders) {
    _setOrderRows('#asks', orders)
}

function _setOrderRows(tableId, orders) {
    const tbody = $(tableId).find('tbody:last-child')
    $(tbody).empty();
    orders.forEach(order => {
        const row = `<tr><td>${order.user}</td><td>${order.ethAvailableVolumeBase}</td><td>${order.ethAvailableVolume}</td><td>${order.price}</td></tr>`
        tbody.append(row)
    })
}

module.exports = {
    'choseTokenByAddress': choseTokenByAddress,
    'logEvent': logEvent,
    'setBidOrders': setBidOrders,
    'setAskOrders': setAskOrders
}
