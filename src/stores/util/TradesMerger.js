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

// TODO txHash is not guaranteed to be unique for a transaction, if a transaction emits multiple trades. E.g.
// TST ropsten - https://ropsten.etherscan.io/tx/0xedf7719ee66cceb355428f2c6e3881310cc0fd3d4b461f58e1647e9c0e73eed8
// VEN mainnet - https://etherscan.io/tx/0x581ece19049db3eb90c4f6f2483ecd50a94dee1ac0c67434490a2eaabebd71f1
// unique composite key should be txHash + logIndex
//
// (only gammadex socket api sends logIndex)
// for the above tx, ED/FD would send repeating txHash - resulting in false de-duping.
export function sortByTimeAndIdRemovingDuplicates(trades) {
    // TODO going to park the deDuping for now and review cases in the wild
    // const deDuped = MessageUtils.removeDups(trades, 'txHash')
    const sorted = _.sortBy(_.sortBy(trades, t => t.id), t => t.date)
    return _.reverse(sorted) // most recent by time first
}

function filterByTokenAddress(trades, tokenAddress) {
    return _.filter(trades, trade => {
        return tokenAddress.toLowerCase() === trade.tokenAddr.toLowerCase()
    })
}