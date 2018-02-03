import _ from "lodash"

export function mergeOrders(existingOrders, incomingOrders, tokenAddress, ascendingPriceOrder = true) {
    const ordersForCurrentToken = filterOrdersByTokenAddress(incomingOrders, tokenAddress)

    if (ordersForCurrentToken.length > 0) {
        const incomingIds = new Set(incomingOrders.map(o => o.id))
        const unchangedCurrentOrders = _.filter(existingOrders, o => !incomingIds.has(o.id)) // removes both deletes and updates
        const incomingChangedOrders = _.filter(incomingOrders, o => !isDelete(o))
        const updatedOrdersUnsorted = unchangedCurrentOrders.concat(incomingChangedOrders)

        return sortByPriceAndId(updatedOrdersUnsorted, ascendingPriceOrder) // sort by id then price so always deterministic order
    } else {
        return existingOrders
    }
}

export function sortByPriceAndId(orders, ascendingPriceOrder) {
    const sorted = _.sortBy(_.sortBy(orders, b => b.id), b => b.price)

    if (ascendingPriceOrder) {
        return sorted
    } else {
        return _.reverse(sorted)
    }
}

function isDelete(order) {
    if (typeof order.delete === 'undefined') {
        return false
    }

    return (order.delete === 'true') || (order.delete === true)
}

function filterOrdersByTokenAddress(orders, tokenAddress) {
    return _.filter(orders, (order) => {
        return tokenAddress === order.tokenGive || tokenAddress === order.tokenGet
    })
}