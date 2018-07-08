import _ from "lodash"
import dateformat from 'dateformat'

export function convertDateToTimestamp(data) {
    return data.map(v => {
        const timestamp = new Date(v.date).getTime()
        return Object.assign({}, v, {date: timestamp})
    })
}

export function convertToOhlc(data, periodMins, dateFormat, useAmountBase = false) {
    if (data.length === 0) {
        return []
    }

    const dataWithTimestamps = convertDateToTimestamp(data)

    const intervalStartAndEndTimePairs = getOhlcIntervals(dataWithTimestamps, periodMins)

    return _.reduce(intervalStartAndEndTimePairs, (acc, startAndEndTime) => {
        const [startTime, endTime] = startAndEndTime

        const entriesInInterval = _.filter(dataWithTimestamps, entry => {
            return entry.date >= startTime && entry.date < endTime
        })

        if (entriesInInterval.length > 0) {
            const prices = entriesInInterval.map(e => e.price)

            acc.open.push(_.first(prices))
            acc.close.push(_.last(prices))
            acc.high.push(Math.max(...prices))
            acc.low.push(Math.min(...prices))
            if(useAmountBase) {
                acc.volume.push(_.sum(entriesInInterval.map(e => parseFloat(e.amountBase))))
            } else {
                acc.volume.push(_.sum(entriesInInterval.map(e => parseFloat(e.amount))))
            }

            const date = new Date((startTime + endTime) / 2)

            if (dateFormat) {
                acc.date.push(dateformat(date, dateFormat))
            } else {
                acc.date.push(date)
            }
        }

        return acc
    }, {
        open: [],
        high: [],
        low: [],
        close: [],
        volume: [],
        date: []
    })
}

export function convertToOhlcReactStockChart(data, periodMins) {
    if(data == null || data.length == 0) {
        return []
    }
    const ohlc = convertToOhlc(data, periodMins, null, true)
    // transpose what plotly expects
    return ohlc.open.map((o, i) => {
        return {
            open: Number(ohlc.open[i]),
            high: ohlc.high[i],
            low: ohlc.low[i],
            close: Number(ohlc.close[i]),
            volume: ohlc.volume[i],
            date: ohlc.date[i],
        }
    })
}

function getOhlcIntervals(data, periodMins) {
    const {min, max} = getMinAndMaxTimestamp(data, periodMins)
    const periodMillis = periodMins * 60 * 1000
    const times = _.range(min, max + 1, periodMillis)
    const intervalStartAndEndTimePairs = _.zip(times, _.drop(times, 1))

    return _.filter(intervalStartAndEndTimePairs, pair => {
        const [startTime, endTime] = pair
        return !_.isUndefined(startTime) && !_.isUndefined(endTime)
    })
}

export function getMinAndMaxTimestamp(data, periodMins) {
    const dates = data.map(d => d.date)

    const min = roundForPeriod(_.first(dates), periodMins, 'down')
    const max = roundForPeriod(_.last(dates), periodMins, 'up')

    return {
        min, max
    }
}

function roundForPeriod(timestamp, periodMins, direction) {
    const periodMillis = periodMins * 60 * 1000
    const flooredTotalMillis = timestamp - Math.max(0, timestamp % periodMillis)

    if (direction === 'down') {
        return flooredTotalMillis
    } else {
        return flooredTotalMillis + periodMillis
    }
}

export function getPricesAndDates(trades, dateFormat) {
    const prices = trades.map(t => ({
        date: dateformat(new Date(t.date), dateFormat),
        price: t.price
    }))

    return _.reduce(prices, (acc, next) => {
        acc.dates.push(next.date)
        acc.prices.push(next.price)

        return acc
    }, {dates: [], prices: []})
}
