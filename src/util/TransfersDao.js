import * as _ from "lodash"

export function saveFailedTransfers(accountAddress, failedTransfers) {
    if (_.isString(accountAddress) && _.isArray(failedTransfers)) {
        if (_.isUndefined(global.localStorage.failedTransfers)) {
            global.localStorage.failedTransfers = JSON.stringify({})
        }

        const parsed = JSON.parse(global.localStorage.failedTransfers)
        parsed[accountAddress.toLowerCase()] = failedTransfers

        global.localStorage.failedTransfers = JSON.stringify(parsed)
    }
}

export function loadFailedTransfers(accountAddress) {
    if (_.isString(accountAddress)) {
        const failedTransfers = _.isString(global.localStorage.failedTransfers) ? JSON.parse(global.localStorage.failedTransfers) : {}

        return failedTransfers[accountAddress.toLowerCase()] ? failedTransfers[accountAddress.toLowerCase()] : []
    } else {
        return []
    }
}

export function savePendingTransfers(accountAddress, pendingTransfers) {
    if (_.isString(accountAddress) && _.isArray(pendingTransfers)) {
        if (_.isUndefined(global.localStorage.pendingTransfers)) {
            global.localStorage.pendingTransfers = JSON.stringify({})
        }

        const parsed = JSON.parse(global.localStorage.pendingTransfers)
        parsed[accountAddress.toLowerCase()] = pendingTransfers

        global.localStorage.pendingTransfers = JSON.stringify(parsed)
    }
}

export function loadPendingTransfers(accountAddress) {
    if (_.isString(accountAddress)) {
        const pendingTransfers = _.isString(global.localStorage.pendingTransfers) ? JSON.parse(global.localStorage.pendingTransfers) : {}

        return pendingTransfers[accountAddress.toLowerCase()] ? pendingTransfers[accountAddress.toLowerCase()] : []

    } else {
        return []
    }
}
