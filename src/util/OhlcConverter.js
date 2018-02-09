import _ from "lodash"

/**
 Convert trade history data to OHLC
 */

export function convertDateToTimestamp(data) {
    return data.map(v => {
        const timestamp = new Date(v.date).getTime()
        return Object.assign(v, {date: timestamp})
    })
}

export const TimePeriod = Object.freeze({
    'mins_5': 5,
    'mins_15': 15,
    'mins_30': 30,
    'hours_1': 60,
    'hours_2': 120,
    'hours_8': 480,
    'days_1': 1440
})

// TODO - add time to result
export function convert(data, periodMins) {
    if (data.length === 0) {
        return []
    }

    const dataWithTimestamps = convertDateToTimestamp(data)

    const intervalStartAndEndTimePairs = getOhlcIntervals(dataWithTimestamps, periodMins)

    return intervalStartAndEndTimePairs.map(startEndTime => {
        const [startTime, endTime] = startEndTime
        const entries = _.filter(dataWithTimestamps, entry => {
            return entry.date >= startTime && entry.date < endTime
        })
        if (entries) {
            const first = _.first(entries)
            const last = _.last(entries)

            const open = first.price
            const close = last.price
            const high = _.reduce(entries, (acc, e) => {
                return Math.max(acc, e.price)
            }, first.price)
            const low = _.reduce(entries, (acc, e) => {
                return Math.min(acc, e.price)
            }, first.price)
            const volume = _.reduce(entries, (acc, e) => {
                return acc + e.amount
            }, 0)

            return {
                open, high, low, close, volume
            }
        } else {
            return {}
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
    const dates = data.map(d => new Date(d.date).getTime())

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