import {splitTrailingZeros, toFixedStringNoTrailingZeros} from '../NumberUtil'
import BigNumber from 'bignumber.js'

test("all trialing zeros get split", () => {
    let number = "1.10000"

    const split = splitTrailingZeros(number)

    expect(split).toEqual(["1.1", "0000"])
})

test("no trialing zeros means no split", () => {
    let number = "1.1"

    const split = splitTrailingZeros(number)

    expect(split).toEqual(["1.1", ""])
})

test("no decimal point means no split", () => {
    let number = "1234"

    const split = splitTrailingZeros(number)

    expect(split).toEqual(["1234", ""])
})

test("the decimal point gets lumped in with the zeros if there are no numbers after the decimal", () => {
    let number = "1.00000"

    const split = splitTrailingZeros(number)

    expect(split).toEqual(["1", ".00000"])
})

test("the zeros before the decimal point do not get split", () => {
    let number = "100.00000"

    const split = splitTrailingZeros(number)

    expect(split).toEqual(["100", ".00000"])
})

test("just . is handled safely", () => {
    let number = "."

    const split = splitTrailingZeros(number)

    expect(split).toEqual(["", "."])
})

test("0.001000 BigDecimal has trialing zeros stripped", () => {
    let result = toFixedStringNoTrailingZeros(BigNumber("0.001000"), 4)

    expect(result).toEqual('0.001')
})

test("0.001000 String has trialing zeros stripped", () => {
    let result = toFixedStringNoTrailingZeros("0.001000", 4)

    expect(result).toEqual('0.001')
})

test("0.000000 String has trialing zeros stripped to .00 if mindecimals is 2", () => {
    let result = toFixedStringNoTrailingZeros("0.000000", 4, 2)

    expect(result).toEqual('0.00')
})

test("1000000 String has nothing stripped", () => {
    let result = toFixedStringNoTrailingZeros("1000000", 4, 2)

    expect(result).toEqual('1000000.00')
})
