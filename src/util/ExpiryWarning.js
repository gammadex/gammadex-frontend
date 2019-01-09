import BigNumber from 'bignumber.js'
import {safeBigNumber} from "../EtherConversion"

const ONE_SEC = safeBigNumber(1)
const ONE_MIN = safeBigNumber(ONE_SEC).times(60)
const FIVE_MINS = ONE_MIN.times(5)
const ONE_HOUR = safeBigNumber(ONE_MIN).times(60)
const ONE_DAY = safeBigNumber(ONE_HOUR).times(24)
const ONE_MONTH = safeBigNumber(ONE_DAY).times(31)
const ONE_YEAR = safeBigNumber(ONE_DAY).times(365)
const TEN_YEARS = safeBigNumber(ONE_YEAR).times(10)

export function getExpiryWarning(expiryBlock, currentBlock, blockTime) {
    if (!expiryBlock || !currentBlock || !blockTime) {
        return {
            description: "?",
            warning: false
        }
    }

    const expirySeconds = safeBigNumber(expiryBlock).minus(safeBigNumber(currentBlock)).multipliedBy(Math.floor(blockTime))

    if (expirySeconds.isGreaterThan(TEN_YEARS)) {
        return {
            description: "never",
            warning: false
        }
    } else if (expirySeconds.isGreaterThan(ONE_YEAR)) {
        return {
            description: timePair(expirySeconds, ONE_YEAR, 'year', ONE_MONTH, 'month'),
            warning: false
        }
    } else if (expirySeconds.isGreaterThan(ONE_MONTH)) {
        return {
            description: timePair(expirySeconds, ONE_MONTH, 'month', ONE_DAY, 'day'),
            warning: false
        }
    } else if (expirySeconds.isGreaterThan(ONE_DAY)) {
        return {
            description: timePair(expirySeconds, ONE_DAY, 'day', ONE_HOUR, 'hour'),
            warning: false
        }
    } else if (expirySeconds.isGreaterThan(ONE_HOUR)) {
        return {
            description: timePair(expirySeconds, ONE_HOUR, 'hour', ONE_MIN, 'min'),
            warning: false
        }
    } else if (expirySeconds.isGreaterThan(FIVE_MINS)) {
        return {
            description: timePair(expirySeconds, ONE_MIN, 'minute', ONE_SEC, 'second'),
            warning: false
        }
    } else if (expirySeconds.isGreaterThan(ONE_MIN)) {
        return {
            description: timePair(expirySeconds, ONE_MIN, 'minute', ONE_SEC, 'second'),
            warning: true
        }
    } else {
        const numSecs = expirySeconds.dividedBy(ONE_SEC).integerValue(BigNumber.ROUND_DOWN)
        const secs = plural(numSecs, 'second')

        return {
            description: `${numSecs} ${secs}`,
            warning: true
        }
    }
}

function timePair(expirySeconds, longTimeLength, longUnit, shortTimeLength, shortUnit) {
    const numLongTime = expirySeconds.dividedBy(longTimeLength).integerValue(BigNumber.ROUND_DOWN)
    const numShortTime = expirySeconds.minus(numLongTime.times(longTimeLength)).dividedBy(shortTimeLength)

    const longUnits = plural(numLongTime, longUnit)
    const shortUnits = plural(numShortTime, shortUnit)

    return `${numLongTime.toFixed(0)} ${longUnits} ${numShortTime.toFixed(0)} ${shortUnits}`
}

function plural(num, prefix) {
    return (num.toFixed(0) === "1") ? `${prefix}` : `${prefix}s`
}