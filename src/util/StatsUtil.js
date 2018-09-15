import _ from 'lodash'

export function topStats(tokenVolume, num, includeOther) {
    const sorted = _.sortBy(tokenVolume, 'volumeInEth').reverse()
    const top = _.take(sorted, num)

    if (includeOther) {
        const other = _.takeRight(sorted, tokenVolume.length - num)
        const otherTotal = _.sumBy(other, 'volumeInEth')

        if (otherTotal > 0) {
            top.push({
                "volumeInEth": otherTotal,
                "tokenName": "other",
                "tokenSymbol": "other",
                "tokenAddress": null
            })
        }
    }

    return _.sortBy(top, 'volumeInEth').reverse()
}
