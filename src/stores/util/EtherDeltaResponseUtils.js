export function removeDups(trades) {
    const seenIds = new Set()
    const result = []

    trades.forEach(element => {
        if (! seenIds.has(element.txHash)) {
            result.push(element)
            seenIds.add(element.txHash)
        }
    })

    return result
}