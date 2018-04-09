export function formatNumber(number, decimals) {
    return Number(number).toFixed(decimals)
}

export function stripDecimalsOffLongNumber(number, minWholeDigits) {
    const match = number.match("^([0-9]{" + minWholeDigits + ",})\.0{1,}$")

    return match ? match[1] : number
}

