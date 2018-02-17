import {convertToOhlc, getMinAndMaxTimestamp, convertDateToTimestamp} from "../OhlcConverter"

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

    expect(ohlc).toEqual([{
        open: 0.005,
        high: 0.010,
        low: 0.005,
        close: 0.010,
        volume: 110,
        date: new Date(1518120900000),
    }])
})

test("check volume sums correctly even when amount is a string (bugfix)", () => {
    const data = [
        {date: "2018-02-08T20:02:08.000Z", price: 0.005, amount: '60'},
        {date: "2018-02-08T20:02:09.000Z", price: 0.010, amount: '50'},
    ]

    const ohlc = convertToOhlc(convertDateToTimestamp(data), 15)

    expect(ohlc[0].volume).toEqual(110)
})

test("check fill forward", () => {
    const data = [
        {date: "2018-02-08T20:02:08.000Z", price: 0.006, amount: '60'},
        {date: "2018-02-08T21:02:08.000Z", price: 0.008, amount: '80'},
    ]

    const ohlc = convertToOhlc(convertDateToTimestamp(data), 30)

    expect(ohlc).toEqual([{
        open: 0.006,
        high: 0.006,
        low: 0.006,
        close: 0.006,
        volume: 60,
        date: new Date('2018-02-08T20:30:00.000Z')
    }, {
        open: 0.006,
        high: 0.006,
        low: 0.006,
        close: 0.006,
        volume: 0,
        date: new Date('2018-02-08T21:00:00.000Z')
    }, {
        open: 0.008,
        high: 0.008,
        low: 0.008,
        close: 0.008,
        volume: 80,
        date: new Date('2018-02-08T21:30:00.000Z')
    }])
})