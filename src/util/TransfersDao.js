import * as _ from "lodash"

if (! global.localStorage) {
    global.localStorage = {} // for tests. TODO - get rid of this.
}

export function saveFailedTransfers(accountAddress, failedTransfers) {
    if (_.isString(accountAddress) && _.isArray(failedTransfers)) {
        if (_.isUndefined(global.localStorage.failedTransfers)) {
            global.localStorage.failedTransfers = JSON.stringify({})
        }

        const parsed = JSON.parse(global.localStorage.failedTransfers)
        parsed[accountAddress] = failedTransfers

        global.localStorage.failedTransfers = JSON.stringify(parsed)
    }
}

export function loadFailedTransfers(accountAddress) {
    const failedTransfers = _.isString(global.localStorage.failedTransfers) ? JSON.parse(global.localStorage.failedTransfers) : {}

    return failedTransfers[accountAddress] ? failedTransfers[accountAddress] : []
}

export function savePendingTransfers(accountAddress, pendingTransfers) {
    if (_.isString(accountAddress) && _.isArray(pendingTransfers)) {
        if (_.isUndefined(global.localStorage.pendingTransfers)) {
            global.localStorage.pendingTransfers = JSON.stringify({})
        }

        const parsed = JSON.parse(global.localStorage.pendingTransfers)
        parsed[accountAddress] = pendingTransfers

        global.localStorage.pendingTransfers = JSON.stringify(parsed)
    }
}

export function loadPendingTransfers(accountAddress) {
    const pendingTransfers = _.isString(global.localStorage.pendingTransfers) ? JSON.parse(global.localStorage.pendingTransfers) : {}

    return pendingTransfers[accountAddress] ? pendingTransfers[accountAddress] : []
}
