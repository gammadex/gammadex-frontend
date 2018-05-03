import OrderFactory from "./OrderFactory"
import Config from "./Config"
import OrderSide from "./OrderSide"
import { baseWeiToEth, tokWeiToEth } from "./EtherConversion"
import BigNumber from 'bignumber.js'

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