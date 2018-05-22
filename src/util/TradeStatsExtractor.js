import * as _ from "lodash"
import BigNumber from 'bignumber.js'

export function extractStats(trades, fromTime) {
    const tokenAddress = trades ? trades[0].tokenAddr : null
    const fromTimeString = fromTime.toISOString()

    const cleanTrades = trades
        .filter(trade => fromTimeString < trade.date)
        .map(trade => ({
            price: BigNumber(trade.price),
            amount: BigNumber(trade.amount),
            amountBase: BigNumber(trade.amountBase),
        }))
        .filter(trade => trade.amount.isGreaterThan(0) && trade.amountBase.isGreaterThan(0))

    if (cleanTrades.length === 0) {
        return {
            low: null, high: null, tokenVolume: null, ethVolume: null, last: null, percentChange: null, tokenAddress
        }
    }

    const rawTradeStats = _.reduce(cleanTrades, (acc, trade) => {
        if (trade.price.isGreaterThan(acc.high)) {
            acc.high = trade.price
        }
        if (trade.price.isLessThan(acc.low)) {
            acc.low = trade.price
        }
        acc.tokenVolume = acc.tokenVolume.plus(trade.amount)
        acc.ethVolume = acc.ethVolume.plus(trade.amountBase)

        return acc
    }, {
        low: cleanTrades[0].price,
        high: cleanTrades[0].price,
        tokenVolume: BigNumber(0),
        ethVolume: BigNumber(0),
    })

    const lastPrice = _.last(cleanTrades).price
    const firstPrice = _.first(cleanTrades).price
    const change = BigNumber(100).times(lastPrice.minus(firstPrice).dividedBy(firstPrice))

    return {
        low: rawTradeStats.low.toString(),
        high: rawTradeStats.high.toString(),
        tokenVolume: rawTradeStats.tokenVolume.toString(),
        ethVolume: rawTradeStats.ethVolume.toString(),
        last: lastPrice.toString(),
        percentChange: change.toString(),
        tokenAddress
    }
}