import _ from "lodash"

// assumes orders are alreay sorted - increasing price for bids and decreasing price for offers
export function cumulativeAdd(orders) {
    const acc = _.reduce(orders, (acc, curr) => {
        let currentPrice = parseFloat(curr.price)
        let currentVolume = parseFloat(curr.ethAvailableVolume)

        acc.result.prices.push(currentPrice)

        const volume = currentVolume + acc.lastVolume
        acc.result.volumes.push(volume)
        acc.lastVolume = volume

        return acc
    }, {result: {prices: [], volumes: []}, lastVolume: 0})

    return acc.result
}