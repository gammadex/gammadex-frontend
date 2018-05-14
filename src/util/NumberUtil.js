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