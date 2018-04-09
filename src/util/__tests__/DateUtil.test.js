import {formatDateForDisplay} from "../DateUtil"

test("Date Parsed", () => {
    const date = "2018-03-20T16:47:12.779Z"

    const formatted = formatDateForDisplay(date)

    expect(formatted).toEqual("03-20 16:47:12")
})

test("Date parsed with year", () => {
    const date = "2018-03-20T16:47:12.779Z"

    const formatted = formatDateForDisplay(date, true)

    expect(formatted).toEqual("2018-03-20 16:47:12")
})

test("Invalid date is passed through", () => {
    const date = "some string, not a date"
    const formatted = formatDateForDisplay(date, true)

    expect(formatted).toEqual("some string, not a date")
})

test("Seconds can be stripped", () => {
    const date = "2018-03-20T16:47:12.779Z"

    const formatted = formatDateForDisplay(date, false, true)

    expect(formatted).toEqual("03-20 16:47")
})