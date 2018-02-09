import {convert, getMinAndMaxTimestamp, convertDateToTimestamp, TimePeriod} from "../OhlcConverter"

test("check empty data returns empty ohlc list", () => {
    const data = []
    const ohlc = convert(data, TimePeriod.mins_5)

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

    const ohlc = getMinAndMaxTimestamp(convertDateToTimestamp(data), TimePeriod.mins_15)

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

    const ohlc = convert(convertDateToTimestamp(data), TimePeriod.mins_15)

    expect(ohlc).toEqual([{
        open: 0.005,
        high: 0.010,
        low: 0.005,
        close: 0.010,
        volume: 110
    }])
})