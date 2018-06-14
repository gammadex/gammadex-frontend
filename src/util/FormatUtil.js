export function formatNumber(number, decimals) {
    return Number(number).toFixed(decimals)
}

export function stripDecimalsOffLongNumber(number, minWholeDigits) {
    const match = number.match("^([0-9]{" + minWholeDigits + ",}).0{1,}$")

    return match ? match[1] : number
}

export function truncate(toTruncate, options) {
    const numKeepLeft = options && options.left ? parseInt(options.left, 10) : 3
    const numKeepRight = options && options.right ? parseInt(options.right, 10) : 3
    const spacer = options && options.spacer ? options.spacer : "..."

    let truncated = toTruncate

    if (toTruncate.length > (numKeepLeft + numKeepRight)) {
        const leftPart = numKeepLeft > 0 ? toTruncate.substr(0, numKeepLeft) : ""
        const rightPart = numKeepRight > 0 ? toTruncate.substr(-numKeepRight) : ""

        truncated = leftPart + spacer + rightPart
    }

    return truncated
}

export function truncateAddress(address) {
    return truncate(address, {
        left: "7", right: "5"
    })
}