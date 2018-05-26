import * as _ from "lodash"

if (! global.localStorage) {
    global.localStorage = {} // for tests. TODO - get rid of this.
}

export function saveFailedTrades(accountAddress, failedTrades) {
    if (_.isString(accountAddress) && _.isArray(failedTrades)) {
        if (_.isUndefined(global.localStorage.failedTrades)) {
            global.localStorage.failedTrades = JSON.stringify({})
        }

        const parsed = JSON.parse(global.localStorage.failedTrades)
        parsed[accountAddress.toLowerCase()] = failedTrades

        global.localStorage.failedTrades = JSON.stringify(parsed)
    }
}

export function loadFailedTrades(accountAddress) {
    if (_.isString(accountAddress)) {
        const failedTrades = _.isString(global.localStorage.failedTrades) ? JSON.parse(global.localStorage.failedTrades) : {}

        return failedTrades[accountAddress.toLowerCase()] ? failedTrades[accountAddress] : []
    } else {
        return []
    }
}

export function savePendingTrades(accountAddress, pendingTrades) {
    if (_.isString(accountAddress) && _.isArray(pendingTrades)) {
        if (_.isUndefined(global.localStorage.pendingTrades)) {
            global.localStorage.pendingTrades = JSON.stringify({})
        }

        const parsed = JSON.parse(global.localStorage.pendingTrades)
        parsed[accountAddress.toLowerCase()] = pendingTrades

        global.localStorage.pendingTrades = JSON.stringify(parsed)
    }
}

export function loadPendingTrades(accountAddress) {
    if (_.isString(accountAddress)) {
        const pendingTrades = _.isString(global.localStorage.pendingTrades) ? JSON.parse(global.localStorage.pendingTrades) : {}

        return pendingTrades[accountAddress.toLowerCase()] ? pendingTrades[accountAddress] : []
    } else {
        return []
    }
}
