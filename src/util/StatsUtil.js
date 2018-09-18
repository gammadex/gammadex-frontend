import _ from 'lodash'

export function topStatsByDay(rawVolumes, displayNum, includeOther) {
    const topTokenAddressess = _(rawVolumes || [])
        .transform((acc, token) => {
            acc[token.tokenAddress] = (acc[token.tokenAddress] || 0) + token.volumeInEth
        }, {})
        .map((volume, tokenAddress) => ({volume, tokenAddress}))
        .sortBy('volume')
        .reverse()
        .take(displayNum)
        .map(t => t.tokenAddress)
        .value()

    const tokenTotals = _(rawVolumes)
        .transform((acc, token) => {
            if (topTokenAddressess.includes(token.tokenAddress)) {
                const tok = (acc[token.tokenAddress] || {})
                const forDate = (tok[token.startTime] || 0)

                tok[token.startTime] = forDate + token.volumeInEth
                acc[token.tokenAddress] = tok
            }
        }, {}).value()

    const dates = _(rawVolumes)
        .map(t => t.startTime)
        .uniq()
        .sort()
        .value()

    const tokenTotalsWithZeros =
        _.transform(topTokenAddressess, (tokAcc, tokenAddress) => {
            const volumes = _.transform(dates, (dateAcc, date) => {
                const tok = tokenTotals[tokenAddress]
                const total = tok[date] || 0

                dateAcc.push(total)
            }, [])

            const tokenDetails = _.find(rawVolumes, t => t.tokenAddress === tokenAddress)
            const token = Object.assign({}, tokenDetails)
            delete token.startTime
            delete token.volumeInEth

            tokAcc.push({token, volumes})
        }, [])

    return {
        dates,
        tokens: tokenTotalsWithZeros,
    }
}

export function topStats(tokenVolume, num, includeOther) {
    const sorted = _.sortBy(tokenVolume, 'volumeInEth').reverse()
    const top = _.take(sorted, num)

    if (includeOther) {
        const other = _.takeRight(sorted, tokenVolume.length - num)
        const otherTotal = _.sumBy(other, 'volumeInEth')

        if (otherTotal > 0) {
            top.push({
                "volumeInEth": otherTotal,
                "tokenName": "others",
                "tokenSymbol": "others",
                "tokenAddress": null
            })
        }
    }

    return _.sortBy(top, 'volumeInEth').reverse()
}
