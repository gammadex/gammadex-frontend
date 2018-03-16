import _ from "lodash"
import * as MessageUtils from "./MessageUtils"

export function mergeOrders(existing, incoming, tokenAddress, ascendingPriceOrder = true) {
    const ordersForCurrentToken = filterForTokenAddress(incoming, tokenAddress)

    if (ordersForCurrentToken.length > 0) {
        const incomingIds = new Set(incoming.map(o => o.id))
        const unchangedCurrentOrders = _.filter(existing, o => !incomingIds.has(o.id)) // removes both deletes and updates
        const incomingChangedOrders = _.filter(incoming, o => !isDelete(o))
        const updatedOrdersUnsorted = unchangedCurrentOrders.concat(incomingChangedOrders)

        return sortByPriceAndIdRemovingDuplicates(updatedOrdersUnsorted, ascendingPriceOrder) // sort by id then price so always deterministic order
    } else {
        return existing
    }
}

export function sortByPriceAndIdRemovingDuplicates(orders, ascendingPriceOrder) {
    const deDupedOrders = MessageUtils.removeDups(orders, 'id').filter(o => !isDelete(o))

    const sorted = _.sortBy(_.sortBy(deDupedOrders, o => o.id), o => o.price)

    if (ascendingPriceOrder) {
        return sorted
    } else {
        return _.reverse(sorted)
    }
}

function isDelete(order) {
    if (typeof order.deleted === 'undefined') {
        return false
    }

    return (order.deleted === 'true') || (order.deleted === true)
}

function filterForTokenAddress(orders, tokenAddress) {
    return _.filter(orders, (order) => {
        return tokenAddress === order.tokenGive || tokenAddress === order.tokenGet
    })
}