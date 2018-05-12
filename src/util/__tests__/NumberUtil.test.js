import {splitTrailingZeros} from '../NumberUtil'

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

