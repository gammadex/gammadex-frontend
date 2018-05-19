export function removeDups(trades, field) {
    const seenIds = new Set()
    const result = []

    trades.forEach(element => {
        if (! seenIds.has(element[field])) {
            result.push(element)
            seenIds.add(element[field])
        }
    })

    return result
}

export function removeDupsWithSortKey(trades, sortKey) {
    const seenIds = new Set()
    const result = []

    trades.forEach(element => {
        const key = sortKey(element)
        if (! seenIds.has(key)) {
            result.push(element)
            seenIds.add(key)
        }
    })

    return result
}
