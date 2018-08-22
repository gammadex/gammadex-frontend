import _ from "lodash"
import math from "mathjs"

// assumes orders are alreay sorted - increasing price for bids and decreasing price for offers
export function cumulativeAdd(orders, addType) {

    if (addType === 'bids') {
        const prices = _(orders).map(o => parseFloat(o.price)).sortBy(x => parseFloat(x)).reverse().value()

        const sample = _.take(prices, 3)
        const sampleSize = sample.length
        let sum = _.sum(sample)
        const avg = sampleSize > 0 ? (sum / sampleSize) : 0
        const threshold = avg / 10

        orders = _(orders).filter(o => parseFloat(o.price) > threshold).sortBy(o => parseFloat(o.price)).reverse().value()
    }

    if (addType === 'offers') {
        const prices = _(orders).map(o => parseFloat(o.price)).sortBy(x => parseFloat(x)).value()

        const sample = _.take(prices, 3)
        const sampleSize = sample.length
        let sum = _.sum(sample)
        const avg = sampleSize > 0 ? (sum / sampleSize) : 0
        const threshold = avg * 10

        orders = _(orders).filter(o => parseFloat(o.price) < threshold).sortBy(o => parseFloat(o.price)).value()
    }

    const res = _.reduce(orders, (acc, curr) => {
        let currentPrice = parseFloat(curr.price)
        let currentVolume = parseFloat(curr.ethAvailableVolumeBase)

        acc.result.prices.push(currentPrice)

        const volume = currentVolume + acc.lastVolume
        acc.result.volumes.push(volume)
        acc.lastVolume = volume


        return acc
    }, {result: {prices: [], volumes: []}, lastVolume: 0})

    if (addType === 'bids') {
        res.result.prices.reverse()
        res.result.volumes.reverse()
    }

    return res.result
}