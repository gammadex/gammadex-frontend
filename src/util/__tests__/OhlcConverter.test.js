import {convertToOhlc, getMinAndMaxTimestamp, convertDateToTimestamp, getPricesAndDates} from "../OhlcConverter"

test("check empty data returns empty ohlc list", () => {
    const data = []
    const ohlc = convertToOhlc(data, 5)

    expect(ohlc).toEqual([])
})

test("string dates get converted to timestamps", () => {
    const data = [{date: "2018-02-08T20:02:08.000Z", foo: 'bar'}]

    const result = convertDateToTimestamp(data)

    expect(result).toEqual([{
        date: 1518120128000,
        foo: 'bar'
    }])
})

test("check two dates in same window return correct min and max timestamp", () => {
    const data = [
        {date: "2018-02-08T20:02:08.000Z"},
        {date: "2018-02-08T20:03:08.000Z"},
    ]

    const ohlc = getMinAndMaxTimestamp(convertDateToTimestamp(data), 15)

    expect(ohlc).toEqual({
        min: new Date("2018-02-08T20:00:00.000Z").getTime(),
        max: new Date("2018-02-08T20:15:00.000Z").getTime()
    })
})

test("check two values in same window map to single ohlc with aggregate values set", () => {
    const data = [
        {date: "2018-02-08T20:02:08.000Z", price: 0.005, amount: 60},
        {date: "2018-02-08T20:02:09.000Z", price: 0.010, amount: 50},
    ]

    const ohlc = convertToOhlc(convertDateToTimestamp(data), 15)

    expect(ohlc).toEqual({
        open: [0.005],
        high: [0.010],
        low: [0.005],
        close: [0.010],
        volume: [110],
        date: [new Date("2018-02-08T20:07:30.000Z")],
    })
})

test("check volume sums correctly even when amount is a string (bugfix)", () => {
    const data = [
        {date: "2018-02-08T20:02:08.000Z", price: 0.005, amount: '60'},
        {date: "2018-02-08T20:02:09.000Z", price: 0.010, amount: '50'},
    ]

    const ohlc = convertToOhlc(convertDateToTimestamp(data), 15)

    expect(ohlc.volume).toEqual([110])
})

test("check date gets formatted", () => {
    const data = [
        {date: "2018-02-08T20:02:08.000Z", price: 0.005, amount: '60'},
    ]

    const ohlc = convertToOhlc(convertDateToTimestamp(data), 15, 'yyyy-mm-dd HH:MM')

    expect(ohlc.date).toEqual(["2018-02-08 20:07"])
})

test("check date price with formatted date", () => {
    const trades = [
        {date: "2018-02-08T20:02:08.000Z", price: 0.005, amount: '60'},
    ]

    const foramtted = getPricesAndDates(trades, 'yyyy-mm-dd HH:MM:ss')

    expect(foramtted).toEqual({prices: [0.005], dates: ["2018-02-08 20:02:08"]})
})