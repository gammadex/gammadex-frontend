import _ from "lodash"
import * as MessageUtils from "./MessageUtils"

export function mergeAndSortTrades(existing, incoming, tokenAddress) {
    const tradesForCurrentToken = filterByTokenAddress(incoming, tokenAddress)

    if (tradesForCurrentToken.length > 0) {
        const updated = existing.concat(incoming)

        return sortByTimeAndIdRemovingDuplicates(updated)
    } else {
        return existing
    }
}

export function sortByTimeAndIdRemovingDuplicates(trades) {
    const deDuped = MessageUtils.removeDups(trades, 'txHash')
    const sorted = _.sortBy(_.sortBy(deDuped, t => t.id), t => t.date)

    return _.reverse(sorted) // most recent by time first
}

function filterByTokenAddress(trades, tokenAddress) {
    return _.filter(trades, trade => {
        return tokenAddress === trade.tokenAddr
    })
}