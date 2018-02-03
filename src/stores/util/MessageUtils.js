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