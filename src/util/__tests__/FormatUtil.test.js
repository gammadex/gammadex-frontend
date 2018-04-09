import {formatNumber, stripDecimalsOffLongNumber} from '../FormatUtil'

test("number with extra decimal place digits gets formatted", () => {
    let input = "1.00001"

    const formatted = formatNumber(input, 3)

    expect(formatted).toEqual("1.000")
})

test("number with too few decimal place digits gets formatted", () => {
    let input = "9999.1"

    const formatted = formatNumber(input, 3)

    expect(formatted).toEqual("9999.100")
})

test("number under min length is unchanged", () => {
    let input = "123.000"

    const formatted = stripDecimalsOffLongNumber(input, 4)

    expect(formatted).toEqual("123.000")
})

test("number over min length has decimal places stripped", () => {
    let input = "123.000"

    const formatted = stripDecimalsOffLongNumber(input, 3)

    expect(formatted).toEqual("123")
})