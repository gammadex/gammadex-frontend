import OrderFactory from "./OrderFactory"
import Config from "./Config"
import OrderSide from "./OrderSide"
import { baseWeiToEth, tokWeiToEth, safeBigNumber } from "./EtherConversion"
import BigNumber from 'bignumber.js'
import GasPriceStore from "./stores/GasPriceStore"

export function priceOf(order) {
    if (isMakerBuy(order)) {
        return baseWeiToEth(order.amountGive).div(tokWeiToEth(order.amountGet, order.tokenGet))
    } else {
        return baseWeiToEth(order.amountGet).div(tokWeiToEth(order.amountGive, order.tokenGive))
    }
}

export function makerSide(order) {
    if(order.tokenGive === Config.getBaseAddress()) {
        return OrderSide.BUY
    } else {
        return OrderSide.SELL
    }
}

export function takerSide(order) {
    if(makerSide(order) === OrderSide.BUY) {
        return OrderSide.SELL
    } else {
        return OrderSide.BUY
    }
}

export function tokenAddress(order) {
    if(order.tokenGive === Config.getBaseAddress()) {
        return order.tokenGet
    } else {
        return order.tokenGive
    }
}

export function isMakerBuy(order) {
    return (makerSide(order) === OrderSide.BUY)
}

export function isMakerSell(order) {
    return (makerSide(order) === OrderSide.SELL)
}

export function isTakerBuy(order) {
    return (takerSide(order) === OrderSide.BUY)
}

export function isTakerSell(order) {
    return (takerSide(order) === OrderSide.SELL)
}

export function blocksToHumanReadableExpiry(blocks) {
    if(blocks === "" || safeBigNumber(blocks).isZero()) {
        return "Blocks must be greater than zero."
    }
    const secondsInHour = 60 * 60
    const secondsInDay = secondsInHour * 24
    const secondsInYear = secondsInDay * 365
    
    const blockTime = GasPriceStore.getBlockTime()
    let seconds = blocks * blockTime
    const years = Math.floor(seconds / secondsInYear)
    seconds -= years * secondsInYear
    const days = Math.floor(seconds / secondsInDay)
    seconds -= days * secondsInDay
    const hours = Math.floor(seconds / secondsInHour)
    seconds -= hours * secondsInHour
    const minutes = Math.floor(seconds / 60)
    seconds -= minutes * 60
    seconds = Math.floor(seconds)

    const strYears = years === 0 ? "" : ` ${years} years`
    const strDays = days === 0 ? "" : ` ${days} days`
    const strHours = hours === 0 ? "" : ` ${hours} hours`
    const strMinutes = minutes === 0 ? "" : ` ${minutes} minutes`
    const strSeconds = seconds === 0 ? "" : ` ${seconds} seconds`

    return `Order will expire in approximately${strYears}${strDays}${strHours}${strMinutes}${strSeconds} (based on ${blockTime.toFixed(1)}s block time)`
}