import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import OrderPlacementStore from "../stores/OrderPlacementStore"
import OrderBookStore from "../stores/OrderBookStore"
import AccountStore from "../stores/AccountStore"
import GasPriceStore from "../stores/GasPriceStore"
import TokenStore from "../stores/TokenStore"
import BigNumber from 'bignumber.js'
import _ from "lodash"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import * as OrderUtil from "../OrderUtil"
import * as AccountActions from "./AccountActions"
import * as MyTradeActions from "./MyTradeActions"
import * as TradeActions from "./TradeActions"
import Config from "../Config"
import TransactionStatus from "../TransactionStatus"
import OrderSide from "../OrderSide"
import OrderState from "../OrderState"
import OrderFactory from "../OrderFactory"
import { tokEthToWei, tokWeiToEth, baseEthToWei, baseWeiToEth, safeBigNumber } from "../EtherConversion"
import EtherDeltaSocket from "../EtherDeltaSocket"
import OrderEntryField from "../OrderEntryField"
import ExpiryType from "../ExpiryType"
import * as GlobalMessageFormatters from "../util/GlobalMessageFormatters"
import * as GlobalMessageActions from "./GlobalMessageActions"
import TokenRepository from "../util/TokenRepository"
import React from "react"
import lifecycleStore from "../stores/LifecycleStore"
import {trackEvent} from '../util/Analytics'

/**
 * Calculate a total value when the price changes
 */
function calcTotal(priceControlled, amountWei, amountControlled) {
    if (amountControlled !== "" && priceControlled !== "") {
        const totalEthControlled = BigNumber(String(amountControlled)).times(BigNumber(String(priceControlled))).toFixed()
        const totalEthWei = baseEthToWei(totalEthControlled)
        return { totalEthWei: totalEthWei, totalEthControlled: totalEthControlled }
    }

    return { totalEthWei: BigNumber(0), totalEthControlled: "" }
}

/**
 * Calculate the amount from the total and price
 */
function calcAmount(priceControlled, totalEthControlled) {
    const priceNum = priceControlled === "" ? 0 : priceControlled
    const priceBN = priceNum === 0 ? BigNumber(1) : BigNumber(String(priceNum))

    const totalEthNum = totalEthControlled === "" ? 0 : totalEthControlled
    const amountControlled = BigNumber(String(totalEthNum)).div(priceBN).toFixed()
    const amountWei = tokEthToWei(amountControlled, TokenStore.getSelectedToken().address)
    const totalEthWei = baseEthToWei(totalEthNum)

    return {
        amountWei,
        amountControlled,
        totalEthWei,
        priceControlled: priceBN.toFixed()
    }
}

export function orderBoxSideChanged(orderBoxSide) {
    dispatcher.dispatch({
        type: ActionNames.ORDER_BOX_SIDE_CHANGED,
        orderBoxSide
    })
}

export function orderBoxTypeChanged(orderBoxType) {
    dispatcher.dispatch({
        type: ActionNames.ORDER_BOX_TYPE_CHANGED,
        orderBoxType
    })
}

export function focusOnOrderBox(orderBoxSide) {
    dispatcher.dispatch({
        type: ActionNames.FOCUS_ON_ORDER_BOX,
        orderBoxSide
    })
}

export function focusOnTradeBox(tradeBoxSide) {
    dispatcher.dispatch({
        type: ActionNames.FOCUS_ON_TRADE_BOX,
        tradeBoxSide
    })
}

export function clearSellOrder() {
    dispatcher.dispatch({
        type: ActionNames.CLEAR_SELL_ORDER,
    })
}

export function clearBuyOrder() {
    dispatcher.dispatch({
        type: ActionNames.CLEAR_BUY_ORDER,
    })
}

export function sellOrderPriceChanged(priceControlled) {
    const { sellOrderAmountWei, sellOrderAmountControlled, sellOrderExpiryType, sellOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()
    const { totalEthWei, totalEthControlled } = calcTotal(priceControlled, sellOrderAmountWei, sellOrderAmountControlled)
    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateSellOrder(totalEthWei, priceControlled, sellOrderAmountControlled, totalEthControlled, sellOrderAmountWei, sellOrderExpiryType, sellOrderExpireAfterBlocks)

    const { unsignedOrder, hash } = unsignedOrderOrNull(orderValid, OrderSide.SELL, expires(OrderSide.SELL), priceControlled, sellOrderAmountControlled, TokenStore.getSelectedToken().address)

    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_PRICE_CHANGED,
        priceControlled,
        totalEthWei,
        totalEthControlled,
        orderValid,
        orderInvalidReason,
        orderInvalidField,
        hasPriceWarning,
        priceWarning,
        unsignedOrder,
        hash
    })
}

export function sellOrderAmountChanged(sellOrderAmountControlled) {
    const sellOrderAmountWei = tokEthToWei(sellOrderAmountControlled, TokenStore.getSelectedToken().address)
    const { sellOrderPriceControlled, sellOrderExpiryType, sellOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()

    const { totalEthWei, totalEthControlled } = calcTotal(sellOrderPriceControlled, sellOrderAmountWei, sellOrderAmountControlled)
    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateSellOrder(totalEthWei, sellOrderPriceControlled, sellOrderAmountControlled, totalEthControlled, sellOrderAmountWei, sellOrderExpiryType, sellOrderExpireAfterBlocks)

    const { unsignedOrder, hash } = unsignedOrderOrNull(orderValid, OrderSide.SELL, expires(OrderSide.SELL), sellOrderPriceControlled, sellOrderAmountControlled, TokenStore.getSelectedToken().address)

    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_AMOUNT_CHANGED,
        amountWei: sellOrderAmountWei,
        amountControlled: sellOrderAmountControlled,
        totalEthWei,
        totalEthControlled,
        orderValid,
        orderInvalidReason,
        orderInvalidField,
        hasPriceWarning,
        priceWarning,
        unsignedOrder,
        hash
    })
}

export function sellOrderTotalEthChanged(totalEthControlled) {
    const { sellOrderExpiryType, sellOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()
    const {
        amountWei,
        amountControlled,
        totalEthWei,
        priceControlled
    } = calcAmount(OrderPlacementStore.getOrderPlacementState().sellOrderPriceControlled, totalEthControlled)

    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateSellOrder(totalEthWei, priceControlled, amountControlled, totalEthControlled, amountWei, sellOrderExpiryType, sellOrderExpireAfterBlocks)

    const { unsignedOrder, hash } = unsignedOrderOrNull(orderValid, OrderSide.SELL, expires(OrderSide.SELL), priceControlled, amountControlled, TokenStore.getSelectedToken().address)

    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_TOTAL_CHANGED,
        amountWei,
        amountControlled,
        totalEthWei,
        totalEthControlled,
        priceControlled,
        orderValid,
        orderInvalidReason,
        orderInvalidField,
        hasPriceWarning,
        priceWarning,
        unsignedOrder,
        hash
    })
}

export function sellOrderExpiryTypeChanged(expiryType) {
    let expireAfterHumanReadableString = OrderPlacementStore.getOrderPlacementState().sellOrderExpireHumanReadableString
    const expireAfterBlocks = OrderPlacementStore.getOrderPlacementState().sellOrderExpireAfterBlocks
    if (expiryType === ExpiryType.BLOCKS) {
        expireAfterHumanReadableString = OrderUtil.blocksToHumanReadableExpiry(Number(expireAfterBlocks))
    }
    sellOrderExpiryChanged(expiryType, expireAfterBlocks, expireAfterHumanReadableString)
}

export function sellOrderExpireAfterBlocksChanged(expireAfterBlocks) {
    const expiryType = OrderPlacementStore.getOrderPlacementState().sellOrderExpiryType
    const expireAfterHumanReadableString = OrderUtil.blocksToHumanReadableExpiry(Number(expireAfterBlocks))
    sellOrderExpiryChanged(expiryType, expireAfterBlocks, expireAfterHumanReadableString)
}

export function sellOrderExpiryChanged(expiryType, expireAfterBlocks, expireAfterHumanReadableString) {
    const { sellOrderAmountWei, sellOrderTotalEthWei, sellOrderPriceControlled, sellOrderAmountControlled, sellOrderTotalEthControlled } = OrderPlacementStore.getOrderPlacementState()
    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateSellOrder(sellOrderTotalEthWei, sellOrderPriceControlled, sellOrderAmountControlled, sellOrderTotalEthControlled, sellOrderAmountWei, expiryType, expireAfterBlocks)

    const { unsignedOrder, hash } = unsignedOrderOrNull(
        orderValid,
        OrderSide.SELL,
        expiryType === ExpiryType.GOOD_TILL_CANCEL ? Config.getBlocksGoodTillCancel() : expireAfterBlocks,
        sellOrderPriceControlled, sellOrderAmountControlled,
        TokenStore.getSelectedToken().address)

    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_EXPIRY_CHANGED,
        expiryType,
        expireAfterBlocks,
        expireAfterHumanReadableString,
        unsignedOrder,
        orderValid,
        orderInvalidReason,
        orderInvalidField,
        hasPriceWarning,
        priceWarning,
        hash
    })
}

// TODO this validation needs to be triggered after: 1) here, 2) wallet balance update, 3) order book update
export function validateSellOrder(totalEthWei, priceControlled, sellOrderAmountControlled, sellOrderTotalEthControlled, amountWei, expiryType, expireAfterBlocks) {
    const tokenAddress = TokenStore.getSelectedToken().address
    const exchangeBalanceTokWei = BigNumber(String(AccountStore.getAccountState().exchangeBalanceTokWei))
    let orderValid = true
    let orderInvalidReason = ""
    let orderInvalidField = OrderEntryField.AMOUNT
    if (amountWei.isGreaterThan(exchangeBalanceTokWei)) {
        orderValid = false
        orderInvalidReason = `Amount greater than exchange balance (${tokWeiToEth(exchangeBalanceTokWei, tokenAddress)})`
    }

    if (expiryType === ExpiryType.BLOCKS && (expireAfterBlocks === "" || safeBigNumber(expireAfterBlocks).isZero())) {
        orderValid = false
        orderInvalidReason = "Blocks must be greater than zero."
        orderInvalidField = OrderEntryField.BLOCKS
    }

    const { hasPriceWarning, priceWarning } = fairValueWarnings(OrderSide.SELL, totalEthWei, priceControlled, sellOrderAmountControlled, sellOrderTotalEthControlled)

    return { orderValid: orderValid, orderInvalidReason: orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning }
}

export function buyOrderPriceChanged(priceControlled) {
    const { buyOrderAmountWei, buyOrderAmountControlled, buyOrderExpiryType, buyOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()
    const { totalEthWei, totalEthControlled } = calcTotal(priceControlled, buyOrderAmountWei, buyOrderAmountControlled)
    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateBuyOrder(totalEthWei, priceControlled, buyOrderAmountControlled, totalEthControlled, buyOrderExpiryType, buyOrderExpireAfterBlocks)

    const { unsignedOrder, hash } = unsignedOrderOrNull(orderValid, OrderSide.BUY, expires(OrderSide.BUY), priceControlled, buyOrderAmountControlled, TokenStore.getSelectedToken().address)
    dispatcher.dispatch({
        type: ActionNames.BUY_ORDER_PRICE_CHANGED,
        priceControlled,
        totalEthWei,
        totalEthControlled,
        orderValid,
        orderInvalidReason,
        orderInvalidField,
        hasPriceWarning,
        priceWarning,
        unsignedOrder,
        hash
    })
}

export function buyOrderAmountChanged(buyOrderAmountControlled) {
    const buyOrderAmountWei = tokEthToWei(buyOrderAmountControlled, TokenStore.getSelectedToken().address)
    const { buyOrderPriceControlled, buyOrderExpiryType, buyOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()

    const { totalEthWei, totalEthControlled } = calcTotal(buyOrderPriceControlled, buyOrderAmountWei, buyOrderAmountControlled)
    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateBuyOrder(totalEthWei, buyOrderPriceControlled, buyOrderAmountControlled, totalEthControlled, buyOrderExpiryType, buyOrderExpireAfterBlocks)

    const { unsignedOrder, hash } = unsignedOrderOrNull(orderValid, OrderSide.BUY, expires(OrderSide.BUY), buyOrderPriceControlled, buyOrderAmountControlled, TokenStore.getSelectedToken().address)

    dispatcher.dispatch({
        type: ActionNames.BUY_ORDER_AMOUNT_CHANGED,
        amountWei: buyOrderAmountWei,
        amountControlled: buyOrderAmountControlled,
        totalEthWei,
        totalEthControlled,
        orderValid,
        orderInvalidReason,
        orderInvalidField,
        hasPriceWarning,
        priceWarning,
        unsignedOrder,
        hash
    })
}

export function buyOrderTotalEthChanged(totalEthControlled) {
    const { buyOrderExpiryType, buyOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()
    const {
        amountWei,
        amountControlled,
        totalEthWei,
        priceControlled
    } = calcAmount(OrderPlacementStore.getOrderPlacementState().buyOrderPriceControlled, totalEthControlled)

    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateBuyOrder(totalEthWei, priceControlled, amountControlled, totalEthControlled, buyOrderExpiryType, buyOrderExpireAfterBlocks)

    const { unsignedOrder, hash } = unsignedOrderOrNull(orderValid, OrderSide.BUY, expires(OrderSide.BUY), priceControlled, amountControlled, TokenStore.getSelectedToken().address)

    dispatcher.dispatch({
        type: ActionNames.BUY_ORDER_TOTAL_CHANGED,
        amountWei,
        amountControlled,
        totalEthWei,
        totalEthControlled,
        priceControlled,
        orderValid,
        orderInvalidReason,
        orderInvalidField,
        hasPriceWarning,
        priceWarning,
        unsignedOrder,
        hash
    })
}

export function buyOrderExpiryTypeChanged(expiryType) {
    let expireAfterHumanReadableString = OrderPlacementStore.getOrderPlacementState().buyOrderExpireHumanReadableString
    const expireAfterBlocks = OrderPlacementStore.getOrderPlacementState().buyOrderExpireAfterBlocks
    if (expiryType === ExpiryType.BLOCKS) {
        expireAfterHumanReadableString = OrderUtil.blocksToHumanReadableExpiry(Number(expireAfterBlocks))
    }
    buyOrderExpiryChanged(expiryType, expireAfterBlocks, expireAfterHumanReadableString)
}

export function buyOrderExpireAfterBlocksChanged(expireAfterBlocks) {
    const expiryType = OrderPlacementStore.getOrderPlacementState().buyOrderExpiryType
    const expireAfterHumanReadableString = OrderUtil.blocksToHumanReadableExpiry(Number(expireAfterBlocks))
    buyOrderExpiryChanged(expiryType, expireAfterBlocks, expireAfterHumanReadableString)
}

export function buyOrderExpiryChanged(expiryType, expireAfterBlocks, expireAfterHumanReadableString) {
    const { buyOrderAmountWei, buyOrderTotalEthWei, buyOrderPriceControlled, buyOrderAmountControlled, buyOrderTotalEthControlled } = OrderPlacementStore.getOrderPlacementState()
    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateBuyOrder(buyOrderTotalEthWei, buyOrderPriceControlled, buyOrderAmountControlled, buyOrderTotalEthControlled, expiryType, expireAfterBlocks)

    const { unsignedOrder, hash } = unsignedOrderOrNull(
        orderValid,
        OrderSide.BUY,
        expiryType === ExpiryType.GOOD_TILL_CANCEL ? Config.getBlocksGoodTillCancel() : expireAfterBlocks,
        buyOrderPriceControlled, buyOrderAmountControlled,
        TokenStore.getSelectedToken().address)

    dispatcher.dispatch({
        type: ActionNames.BUY_ORDER_EXPIRY_CHANGED,
        expiryType,
        expireAfterBlocks,
        expireAfterHumanReadableString,
        unsignedOrder,
        orderValid,
        orderInvalidReason,
        orderInvalidField,
        hash
    })
}

export function validateBuyOrder(totalEthWei, priceControlled, buyOrderAmountControlled, buyOrderTotalEthControlled, expiryType, expireAfterBlocks) {
    const exchangeBalanceEthWei = BigNumber(String(AccountStore.getAccountState().exchangeBalanceEthWei))
    let orderValid = true
    let orderInvalidReason = ""
    let orderInvalidField = OrderEntryField.AMOUNT
    if (totalEthWei.isGreaterThan(exchangeBalanceEthWei)) {
        orderValid = false
        orderInvalidReason = `Total amount greater than exchange balance (${baseWeiToEth(exchangeBalanceEthWei)} ETH)`
        orderInvalidField = OrderEntryField.TOTAL
    }
    if (expiryType === ExpiryType.BLOCKS && (expireAfterBlocks === "" || safeBigNumber(expireAfterBlocks).isZero())) {
        orderValid = false
        orderInvalidReason = "Blocks must be greater than zero."
        orderInvalidField = OrderEntryField.BLOCKS
    }

    const { hasPriceWarning, priceWarning } = fairValueWarnings(OrderSide.BUY, totalEthWei, priceControlled, buyOrderAmountControlled, buyOrderTotalEthControlled)
    return { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning }
}

export function fairValueWarnings(orderSide, totalEthWei, priceControlled, amountControlled, totalEthControlled) {
    let hasPriceWarning = false
    let priceWarning = ""
    const tokenName = TokenStore.getSelectedToken().symbol
    if (!totalEthWei.isZero()) {

        let noMarketTrades = null
        let priceAwayFromLastTraded = null
        let noOrders = null
        let crossedSpread = null

        if(OrderBookStore.getTrades().length === 0) {
            hasPriceWarning = true
            noMarketTrades = <li>There are no recent trades for {tokenName}</li>
        } else {
            const lastTradedPrice = Number(OrderBookStore.getTrades()[0].price)
            const orderPrice = Number(priceControlled)
            const change = (orderPrice - lastTradedPrice) / lastTradedPrice
    
            if (Math.abs(change) > Config.getAwayFromLastTradeThreshold()) {
                hasPriceWarning = true
                priceAwayFromLastTraded = <li>Your Price {priceControlled} is {(change * 100.0).toFixed(0)}% away from Last Market Trade {lastTradedPrice.toFixed(8)}</li>
            }
        }

        if(OrderBookStore.getOffers().length === 0) {
            hasPriceWarning = true
            noOrders = <li>There are no orders to SELL {tokenName}</li>            
        } else if (orderSide === OrderSide.BUY) {
            const bestOffer = safeBigNumber(OrderBookStore.getOffers()[0].price)
            if(safeBigNumber(priceControlled).isGreaterThan(bestOffer)) {
                hasPriceWarning = true
                crossedSpread = <li>Your Price {priceControlled} is > Best Offer Price ({bestOffer.toFixed(8)})</li>
            }
        }

        if(OrderBookStore.getBids().length === 0) {
            hasPriceWarning = true
            noOrders = <li>There are no orders to BUY {tokenName}</li>            
        } else if (orderSide === OrderSide.SELL) {
            const bestBid = safeBigNumber(OrderBookStore.getBids()[0].price)
            if(safeBigNumber(priceControlled).isLessThan(bestBid)) {
                hasPriceWarning = true
                crossedSpread = <li>Your Price {priceControlled} is &lt; Best Bid Price ({bestBid.toFixed(8)})</li>
            }
        }

        if(OrderBookStore.getOffers().length === 0 && OrderBookStore.getBids().length === 0) {
            hasPriceWarning = true
            noOrders = <li>There are no orders for {tokenName}</li>  
        }

        const side = orderSide === OrderSide.BUY ? "BUY" : "SELL"
        if(hasPriceWarning) {
            priceWarning =
                <div>
                    <div><i className="fas fa-exclamation-triangle" /> Fat Finger Warning</div>
                    <br/>
                    <ul className="fair-value-list">
                        {noMarketTrades}
                        {priceAwayFromLastTraded}
                        {noOrders}
                        {crossedSpread}
                    </ul>
                    <div>Dismiss this warning if you intend to:</div>
                    <div><strong>{side} {amountControlled} {tokenName} and {orderSide === OrderSide.BUY ? "PAY" : "RECEIVE"} {totalEthControlled} ETH</strong></div>
                </div>
        }
    }

    return { hasPriceWarning, priceWarning }
}

export function buyPriceWarningDismissed() {
    dispatcher.dispatch({
        type: ActionNames.BUY_ORDER_PRICE_WARNING_DISMISSED
    })
}

export function sellPriceWarningDismissed() {
    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_PRICE_WARNING_DISMISSED
    })
}

export function executeBuy() {
    const tokenAddress = TokenStore.getSelectedToken().address
    const {
        buyOrderPriceControlled,
        buyOrderAmountControlled,
        buyOrderTotalEthWei,
        buyOrderAmountWei,
        buyOrderExpiryType,
        buyOrderExpireAfterBlocks,
        buyOrderUnsigned,
        buyOrderHash } = OrderPlacementStore.getOrderPlacementState()
    const selectedToken = TokenStore.getSelectedToken()
    const order = {
        makerSide: OrderSide.BUY,
        expires: buyOrderUnsigned.expires,
        price: buyOrderPriceControlled,
        amount: buyOrderAmountControlled,
        tokenAddress: selectedToken.address,
        tokenName: selectedToken.symbol,
        orderUnsigned: buyOrderUnsigned,
        orderHash: buyOrderHash
    }
    sendOrder(order)
}

export function executeSell() {
    const {
        sellOrderPriceControlled,
        sellOrderAmountControlled,
        sellOrderAmountWei,
        sellOrderExpiryType,
        sellOrderExpireAfterBlocks,
        sellOrderUnsigned,
        sellOrderHash } = OrderPlacementStore.getOrderPlacementState()
    const selectedToken = TokenStore.getSelectedToken()
    const order = {
        makerSide: OrderSide.SELL,
        expires: sellOrderUnsigned.expires,
        price: sellOrderPriceControlled,
        amount: sellOrderAmountControlled,
        tokenAddress: selectedToken.address,
        tokenName: selectedToken.symbol,
        orderUnsigned: sellOrderUnsigned,
        orderHash: sellOrderHash
    }
    sendOrder(order)
}

export function expires(makerSide) {
    if (makerSide === OrderSide.BUY) {
        const { buyOrderExpiryType, buyOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()
        return buyOrderExpiryType === ExpiryType.GOOD_TILL_CANCEL ? Config.getBlocksGoodTillCancel() : buyOrderExpireAfterBlocks
    } else {
        const { sellOrderExpiryType, sellOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()
        return sellOrderExpiryType === ExpiryType.GOOD_TILL_CANCEL ? Config.getBlocksGoodTillCancel() : sellOrderExpireAfterBlocks
    }
}

// NOTE: nonce is randomly generated so this is not referentially transparent
export function unsignedOrderOrNull(orderValid, makerSide, expireAfterBlocks, price, amount, tokenAddress) {
    const currentBlockNumber = lifecycleStore.getCurrentBlockNumber()
    if (orderValid && price != "" && amount != "" && currentBlockNumber && expireAfterBlocks != "" && expireAfterBlocks > 0) {
        const expires = safeBigNumber(currentBlockNumber).plus(safeBigNumber(expireAfterBlocks))
        const unsignedOrder = OrderFactory.createUnsignedOrder(makerSide, expires, price, amount, tokenAddress)
        const {
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            nonce } = unsignedOrder
        const hash = OrderFactory.orderHash(tokenGet, amountGet, tokenGive, amountGive, expires, nonce)
        return { unsignedOrder, hash }
    } else {
        return { unsignedOrder: null, hash: null }
    }
}

export function sendOrder(order) {
    const {
        amountGet,
        amountGive,
        tokenGet,
        tokenGive,
        contractAddr,
        nonce
    } = order.orderUnsigned

    const { account } = AccountStore.getAccountState()
    EtherDeltaWeb3.promiseSignData(order.orderHash, account)
        .then(sig => {
            const signedOrderObject = {
                amountGet,
                amountGive,
                tokenGet,
                tokenGive,
                contractAddr,
                expires: order.expires,
                nonce,
                user: account,
                v: sig.v,
                r: sig.r,
                s: sig.s,
            }
            const side = OrderUtil.isMakerBuy(signedOrderObject) ? "BUY" : "SELL"
            const tokenName = TokenRepository.getTokenName(OrderUtil.tokenAddress(signedOrderObject))
            GlobalMessageActions.sendGlobalMessage(
                GlobalMessageFormatters.getOrderInitiated(side, tokenName))
            trackEvent("order",side,`${tokenName}:${account}:${order.orderHash}`)
            EtherDeltaSocket.emitOrder(signedOrderObject)
                .then((result) => {
                    if (result && result.status === 202) {
                        if (OrderUtil.isMakerBuy(signedOrderObject)) {
                            clearBuyOrder()
                        } else {
                            clearSellOrder()
                        }
                    } else if (result) {
                        const error = `status: ${result.status}, message: ${result.message}`
                        GlobalMessageActions.sendGlobalMessage(
                            GlobalMessageFormatters.getOrderRejected(side, tokenName, error), 'danger')
                    }
                })
        })
}

export function sendOnChainOrder(order) {
    const {
        amountGet,
        amountGive,
        tokenGet,
        tokenGive,
        contractAddr,
    } = order.orderUnsigned

    const { account, nonce } = AccountStore.getAccountState()
    const gasPriceWei = GasPriceStore.getCurrentGasPriceWei()

    const orderObject = {
        amountGet,
        amountGive,
        tokenGet,
        tokenGive,
        expires: order.expires,
        nonce: Math.random().toString().slice(2)
    }
    const side = OrderUtil.isMakerBuy(orderObject) ? "BUY" : "SELL"
    const tokenName = TokenRepository.getTokenName(OrderUtil.tokenAddress(orderObject))

    EtherDeltaWeb3.promiseOrder(account, nonce, orderObject, gasPriceWei)
        .once('transactionHash', hash => {
            AccountActions.nonceUpdated(nonce + 1)
            GlobalMessageActions.sendGlobalMessage(
                GlobalMessageFormatters.getOnChainOrderInitiated(side, tokenName, hash))
        })
        .on('error', error => {
            GlobalMessageActions.sendGlobalMessage(
                GlobalMessageFormatters.getOnChainOrderFailed(side, tokenName, error), 'danger')
        })
        .then(receipt => {
            if (OrderUtil.isMakerBuy(orderObject)) {
                clearBuyOrder()
            } else {
                clearSellOrder()
            }
            GlobalMessageActions.sendGlobalMessage(
                GlobalMessageFormatters.getOnChainOrderComplete(side, tokenName), 'success')
        })
}