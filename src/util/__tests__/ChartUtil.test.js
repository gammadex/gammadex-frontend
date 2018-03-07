import {getInitialDateRange} from "../ChartUtil"

test("check one hour period gives two day range", () => {
    const range = getInitialDateRange(60, "2018-02-02T20:02:08.000Z", "2018-02-08T20:02:08.000Z")

    expect(range).toEqual(["2018-02-06 20:02", "2018-02-08 20:02"])
})

test("check 24 hour period gives 5 day range", () => {
    const range = getInitialDateRange((24 * 60), "2018-02-02T20:00:00.000Z", "2018-02-20T20:00:00.000Z")

    expect(range).toEqual(["2018-02-15 20:00", "2018-02-20 20:00"])
})

test("start for range is floored to actual start date", () => {
    const range = getInitialDateRange((24 * 60), "2018-02-19T20:00:00.000Z", "2018-02-20T20:00:00.000Z")

    expect(range).toEqual(["2018-02-19 20:00", "2018-02-20 20:00"])
})
