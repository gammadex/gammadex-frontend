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

export function convert(data, periodMins) {
    if (data.length === 0) {
        return []
    }

    const dataWithTimestamps = convertDateToTimestamp(data)

    const intervalStartAndEndTimePairs = getOhlcIntervals(dataWithTimestamps, periodMins)

    return intervalStartAndEndTimePairs.map(startEndTime => {
        const [startTime, endTime] = startEndTime

        const entriesInInterval = _.filter(dataWithTimestamps, entry => {
            return entry.date >= startTime && entry.date < endTime
        })

        if (entriesInInterval) {
            const prices = entriesInInterval.map(e => e.price)
            const open = _.first(prices)
            const close = _.last(prices)
            const high = Math.max(...prices)
            const low = Math.min(...prices)
            const volume = _.sum(entriesInInterval.map(e => e.amount))

            return {
                open, high, low, close, volume, date: endTime
            }
        } else {
            return {} // TODO - what is best for an empty interval?
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