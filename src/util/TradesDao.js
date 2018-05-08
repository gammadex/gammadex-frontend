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
        parsed[accountAddress] = failedTrades

        global.localStorage.failedTrades = JSON.stringify(parsed)
    }
}

export function loadFailedTrades(accountAddress) {
    const failedTrades = _.isString(global.localStorage.failedTrades) ? JSON.parse(global.localStorage.failedTrades) : {}

    return failedTrades[accountAddress] ? failedTrades[accountAddress] : []
}

export function savePendingTrades(accountAddress, pendingTrades) {
    if (_.isString(accountAddress) && _.isArray(pendingTrades)) {
        if (_.isUndefined(global.localStorage.pendingTrades)) {
            global.localStorage.pendingTrades = JSON.stringify({})
        }

        const parsed = JSON.parse(global.localStorage.pendingTrades)
        parsed[accountAddress] = pendingTrades

        global.localStorage.pendingTrades = JSON.stringify(parsed)
    }
}

export function loadPendingTrades(accountAddress) {
    const pendingTrades = _.isString(global.localStorage.pendingTrades) ? JSON.parse(global.localStorage.pendingTrades) : {}

    return pendingTrades[accountAddress] ? pendingTrades[accountAddress] : []
}
