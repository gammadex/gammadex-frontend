import {safeBigNumber} from "../EtherConversion"

export function splitTrailingZeros(number) {
    if (number.includes('.')) {
        const decimalPointIndex = number.lastIndexOf(".")

        let splitIndex = number.length
        while ((number[splitIndex-1] === "0" || number[splitIndex-1] === ".") && splitIndex > decimalPointIndex) {
            splitIndex -= 1
        }

        return [number.slice(0, splitIndex), number.slice(splitIndex)]
    } else {
        return [number, '']
    }
}

export function toFixedStringNoTrailingZeros(number, decimals, minDecimals=0) {
    const num = safeBigNumber(number).toFixed(decimals).toString()

    let match = null
    if (minDecimals > 0) {
        match = num.match("^([0-9]*.[0-9]{" + minDecimals + "})0{1,}$")
    } else {
        match = num.match("^([0-9]+.[0-9]*[1-9])0{1,}$")
    }

    return match ? match[1] : num
}