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

export function convertToOhlc(data, periodMins) {
    if (data.length === 0) {
        return []
    }

    const dataWithTimestamps = convertDateToTimestamp(data)

    const intervalStartAndEndTimePairs = getOhlcIntervals(dataWithTimestamps, periodMins)

    const ohlc = intervalStartAndEndTimePairs.map(startEndTime => {
        const [startTime, endTime] = startEndTime

        const entriesInInterval = _.filter(dataWithTimestamps, entry => {
            return entry.date >= startTime && entry.date < endTime
        })

        if (entriesInInterval.length > 0) {
            console.log("woot", entriesInInterval.length)

            const prices = entriesInInterval.map(e => e.price)
            const open = _.first(prices)
            const close = _.last(prices)
            const high = Math.max(...prices)
            const low = Math.min(...prices)
            const volume = _.sum(entriesInInterval.map(e => parseFloat(e.amount)))

            return {
                open, high, low, close, volume, date: new Date(endTime)
            }
        } else {
            return {
                volume: 0,
                date: new Date(endTime)
            }
        }
    })

    return _.reduce(ohlc, (acc, curr) => {
        const [forwardFilledOhlcs, prev] = acc

        if (curr.volume === 0) {
            forwardFilledOhlcs.push({
                open: prev.close,
                high: prev.close,
                low: prev.close,
                close: prev.close,
                volume: 0,
                date: curr.date
            })

            return acc
        } else {
            forwardFilledOhlcs.push(curr)
            acc[1] = curr

            return acc
        }

    }, [[], ohlc[0]])[0]
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