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

/**
 * Calculate a total value when the price changes
 */
function calcTotal(priceControlled, amountWei, amountControlled, ethControlled) {
    if (amountControlled !== "" && priceControlled !== "") {
        const totalEthWei = BigNumber(String(priceControlled)).times(amountWei).dp(0, BigNumber.ROUND_FLOOR)
        const totalEthControlled = baseWeiToEth(totalEthWei).toFixed()
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

export function orderBoxTypeChanged(orderBoxType) {
    dispatcher.dispatch({
        type: ActionNames.ORDER_BOX_TYPE_CHANGED,
        orderBoxType
    })
}

export function orderBoxTradeSideChanged(orderBoxTradeSide) {
    dispatcher.dispatch({
        type: ActionNames.ORDER_BOX_TRADE_SIDE_CHANGED,
        orderBoxTradeSide
    })
}

export function orderBoxOrderSideChanged(orderBoxOrderSide) {
    dispatcher.dispatch({
        type: ActionNames.ORDER_BOX_ORDER_SIDE_CHANGED,
        orderBoxOrderSide
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

export function sellOrderPriceChanged(priceControlled) {
    const { sellOrderAmountWei, sellOrderAmountControlled, sellOrderTotalEthControlled, sellOrderExpiryType, sellOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()
    const { totalEthWei, totalEthControlled } = calcTotal(priceControlled, sellOrderAmountWei, sellOrderAmountControlled, sellOrderTotalEthControlled)
    const { orderValid, orderInvalidReason, orderInvalidField } = validateSellOrder(sellOrderAmountWei, sellOrderExpiryType, sellOrderExpireAfterBlocks)

    const { unsignedOrder, hash } = unsignedOrderOrNull(orderValid, OrderSide.SELL, expires(OrderSide.SELL), priceControlled, sellOrderAmountControlled, TokenStore.getSelectedToken().address)

    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_PRICE_CHANGED,
        priceControlled,
        totalEthWei,
        totalEthControlled,
        orderValid,
        orderInvalidReason,
        orderInvalidField,
        unsignedOrder,
        hash
    })
}

export function sellOrderAmountChanged(sellOrderAmountControlled) {
    const sellOrderAmountWei = tokEthToWei(sellOrderAmountControlled, TokenStore.getSelectedToken().address)
    const { sellOrderPriceControlled, sellOrderTotalEthControlled, sellOrderExpiryType, sellOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()

    const { totalEthWei, totalEthControlled } = calcTotal(sellOrderPriceControlled, sellOrderAmountWei,
        sellOrderAmountControlled, sellOrderTotalEthControlled)
    const { orderValid, orderInvalidReason, orderInvalidField } = validateSellOrder(sellOrderAmountWei, sellOrderExpiryType, sellOrderExpireAfterBlocks)

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

    const { orderValid, orderInvalidReason, orderInvalidField } = validateSellOrder(amountWei, sellOrderExpiryType, sellOrderExpireAfterBlocks)

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
    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateSellOrder(sellOrderAmountWei, expiryType, expireAfterBlocks)

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
        hash
    })
}

// TODO this validation needs to be triggered after: 1) here, 2) wallet balance update, 3) order book update
export function validateSellOrder(amountWei, expiryType, expireAfterBlocks) {
    const tokenAddress = TokenStore.getSelectedToken().address
    const exchangeBalanceTokWei = BigNumber(String(AccountStore.getAccountState().exchangeBalanceTokWei))
    let orderValid = true
    let orderInvalidReason = ""
    let orderInvalidField = OrderEntryField.AMOUNT
    if (amountWei.isGreaterThan(exchangeBalanceTokWei)) {
        orderValid = false
        orderInvalidReason = `Amount greater than wallet balance (${tokWeiToEth(exchangeBalanceTokWei, tokenAddress)})`
    }
    const bidTotalWei = OrderBookStore.getBidTotal()
    if (amountWei.isGreaterThan(bidTotalWei)) {
        orderValid = false
        orderInvalidReason = `Amount greater than orderbook total bid size (${tokWeiToEth(bidTotalWei, tokenAddress)})`
    }

    if (expiryType === ExpiryType.BLOCKS && (expireAfterBlocks === "" || safeBigNumber(expireAfterBlocks).isZero())) {
        orderValid = false
        orderInvalidReason = "Blocks must be greater than zero."
        orderInvalidField = OrderEntryField.BLOCKS
    }

    return { orderValid: orderValid, orderInvalidReason: orderInvalidReason, orderInvalidField }
}

export function buyOrderPriceChanged(priceControlled) {
    const { buyOrderAmountWei, buyOrderAmountControlled, buyOrderTotalEthControlled, buyOrderExpiryType, buyOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()
    const { totalEthWei, totalEthControlled } = calcTotal(priceControlled, buyOrderAmountWei, buyOrderAmountControlled, buyOrderTotalEthControlled)
    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateBuyOrder(buyOrderAmountWei, totalEthWei, priceControlled, buyOrderAmountControlled, buyOrderTotalEthControlled, buyOrderExpiryType, buyOrderExpireAfterBlocks)

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
    const { buyOrderPriceControlled, buyOrderTotalEthControlled, buyOrderExpiryType, buyOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()

    const { totalEthWei, totalEthControlled } = calcTotal(buyOrderPriceControlled, buyOrderAmountWei,
        buyOrderAmountControlled, buyOrderTotalEthControlled)
    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateBuyOrder(buyOrderAmountWei, totalEthWei, buyOrderPriceControlled, buyOrderAmountControlled, buyOrderTotalEthControlled, buyOrderExpiryType, buyOrderExpireAfterBlocks)

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

    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateBuyOrder(amountWei, totalEthWei, priceControlled, amountControlled, totalEthControlled, buyOrderExpiryType, buyOrderExpireAfterBlocks)

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
    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateBuyOrder(buyOrderAmountWei, buyOrderTotalEthWei, buyOrderPriceControlled, buyOrderAmountControlled, buyOrderTotalEthControlled, expiryType, expireAfterBlocks)

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

export function validateBuyOrder(amountWei, totalEthWei, priceControlled, buyOrderAmountControlled, buyOrderTotalEthControlled, expiryType, expireAfterBlocks) {
    const exchangeBalanceEthWei = BigNumber(String(AccountStore.getAccountState().exchangeBalanceEthWei))
    let orderValid = true
    let orderInvalidReason = ""
    let orderInvalidField = OrderEntryField.AMOUNT
    if (totalEthWei.isGreaterThan(exchangeBalanceEthWei)) {
        orderValid = false
        orderInvalidReason = `Total amount greater than wallet balance (${baseWeiToEth(exchangeBalanceEthWei)} ETH)`
        orderInvalidField = OrderEntryField.TOTAL
    }
    if (expiryType === ExpiryType.BLOCKS && (expireAfterBlocks === "" || safeBigNumber(expireAfterBlocks).isZero())) {
        orderValid = false
        orderInvalidReason = "Blocks must be greater than zero."
        orderInvalidField = OrderEntryField.BLOCKS
    }

    let hasPriceWarning = false
    let priceWarning = ""
    if (!totalEthWei.isZero()) {
        // TODO handle no market trades
        // TODO check buyOrderTotalEthControlled as the value passed in looks stale
        const lastTradedPrice = Number(OrderBookStore.getTrades()[0].price)
        const orderPrice = Number(priceControlled)
        const change = (orderPrice - lastTradedPrice) / lastTradedPrice
        if (Math.abs(change) > 0.5) {
            hasPriceWarning = true
            priceWarning =
                `Your order price of ${priceControlled} represents a ${(change * 100.0).toFixed(1)}% change to the last traded price of ${lastTradedPrice.toFixed(8)}.
            Dismiss this warning and click BUY if your true intent is to:
            Give ${buyOrderTotalEthControlled} ETH and get ${buyOrderAmountControlled} ${TokenStore.getSelectedToken().name}.`
        }
    }

    return { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning }
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
    const expires = buyOrderExpiryType === ExpiryType.GOOD_TILL_CANCEL ? Config.getBlocksGoodTillCancel() : buyOrderExpireAfterBlocks
    const selectedToken = TokenStore.getSelectedToken()
    const order = {
        makerSide: OrderSide.BUY,
        expires: expires,
        price: buyOrderPriceControlled,
        amount: buyOrderAmountControlled,
        tokenAddress: selectedToken.address,
        tokenName: selectedToken.name,
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
    const expires = sellOrderExpiryType === ExpiryType.GOOD_TILL_CANCEL ? Config.getBlocksGoodTillCancel() : sellOrderExpireAfterBlocks
    const selectedToken = TokenStore.getSelectedToken()
    const order = {
        makerSide: OrderSide.SELL,
        expires: expires,
        price: sellOrderPriceControlled,
        amount: sellOrderAmountControlled,
        tokenAddress: selectedToken.address,
        tokenName: selectedToken.name,
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
export function unsignedOrderOrNull(orderValid, makerSide, expires, price, amount, tokenAddress) {
    if (orderValid && price != "" && amount != "" && expires != "" && expires > 0) {
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
            EtherDeltaSocket.emitOrder(signedOrderObject)
                .then((result) => {
                    if (result && result.status === 202) {
                        // TODO hook in global message
                    }
                })
        })
}