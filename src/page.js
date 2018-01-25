const $ = require('jquery')
const _ = require('lodash')
const model = require("./model-store.js").get()
const tokenSelector = require('./token-selector.js')

function updateAll() {
    updateToken()
    updateEvents()
    updateBids()
    updateOffers()
}

function updateToken() {
    $('#bidsToken')[0].innerText = model.token.name
    $('#offersToken')[0].innerText = model.token.name
    tokenSelector.setValue(model.token.address, false)
}

function updateBids() {
    const {page, bids} = model.orderBook.bidsTable
    const orders = _getOrders(page, bids)
    _setOrderRows('#bids', orders)
}

function updateOffers() {
    const {page, offers} = model.orderBook.offersTable
    const orders = _getOrders(page, offers)
    _setOrderRows('#offers', orders)
}

function updateEvents() {
    const tBody = $('#events').find('> tbody:first-child')
    tBody.empty()

    _.take(model.events, 10).forEach((eventMessage) => {
        tBody.prepend(`<tr><td>${eventMessage}</td></tr>`)
    })
}

function _getOrders(page, orders) {
    const pageSize = model.orderBookPageSize
    const numPagesTotal = Math.ceil(orders.length / pageSize)
    const actualPage = numPagesTotal < page ? numPagesTotal : page

    return orders.slice((actualPage - 1) * pageSize, actualPage * pageSize)
}

function _setOrderRows(tableId, orders) {
    const tbody = $(tableId).find('tbody:last-child')[0]
    $(tbody).empty()
    orders.forEach(order => {
        const row = `<tr><td>${order.user.substring(0, 10)}...</td><td>${order.ethAvailableVolumeBase}</td><td>${order.ethAvailableVolume}</td><td>${order.price}</td></tr>`
        $(tbody).append(row)
    })
}

module.exports = {
    'updateAll': updateAll,
    'updateToken': updateToken,
    'updateBids': updateBids,
    'updateOffers': updateOffers,
    'updateEvents': updateEvents
}
