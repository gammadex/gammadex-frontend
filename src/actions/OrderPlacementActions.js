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
import * as OpenOrderActions from "./OpenOrderActions"
import Config from "../Config"
import TransactionStatus from "../TransactionStatus"
import OrderSide from "../OrderSide"
import OrderState from "../OrderState"
import OrderFactory from "../OrderFactory"
import OrderType from "../OrderType"
import { tokEthToWei, tokWeiToEth, baseEthToWei, baseWeiToEth, safeBigNumber } from "../EtherConversion"
import EtherDeltaSocket from "../EtherDeltaSocket"
import OrderEntryField from "../OrderEntryField"
import ExpiryType from "../ExpiryType";

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

export function sellOrderTypeChanged(orderType) {
    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_TYPE_CHANGED,
        orderType,
    })
}

export function sellOrderPriceChanged(priceControlled) {
    const { sellOrderAmountWei, sellOrderAmountControlled, sellOrderTotalEthControlled, sellOrderExpiryType, sellOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()
    const { totalEthWei, totalEthControlled } = calcTotal(priceControlled, sellOrderAmountWei, sellOrderAmountControlled, sellOrderTotalEthControlled)
    const { orderValid, orderInvalidReason, orderInvalidField } = validateSellOrder(sellOrderAmountWei, sellOrderExpiryType, sellOrderExpireAfterBlocks)

    const hash = orderHash(orderValid, OrderSide.SELL, expires(OrderSide.SELL), priceControlled, sellOrderAmountControlled, TokenStore.getSelectedToken().address)

    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_PRICE_CHANGED,
        priceControlled,
        totalEthWei,
        totalEthControlled,
        orderValid,
        orderInvalidReason,
        orderInvalidField,
        hash
    })
}

export function sellOrderAmountChanged(sellOrderAmountControlled) {
    const sellOrderAmountWei = tokEthToWei(sellOrderAmountControlled, TokenStore.getSelectedToken().address)
    const { sellOrderPriceControlled, sellOrderTotalEthControlled, sellOrderExpiryType, sellOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()

    const { totalEthWei, totalEthControlled } = calcTotal(sellOrderPriceControlled, sellOrderAmountWei,
        sellOrderAmountControlled, sellOrderTotalEthControlled)
    const { orderValid, orderInvalidReason, orderInvalidField } = validateSellOrder(sellOrderAmountWei, sellOrderExpiryType, sellOrderExpireAfterBlocks)

    const hash = orderHash(orderValid, OrderSide.SELL, expires(OrderSide.SELL), sellOrderPriceControlled, sellOrderAmountControlled, TokenStore.getSelectedToken().address)

    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_AMOUNT_CHANGED,
        amountWei: sellOrderAmountWei,
        amountControlled: sellOrderAmountControlled,
        totalEthWei,
        totalEthControlled,
        orderValid,
        orderInvalidReason,
        orderInvalidField,
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

    const { orderValid, orderInvalidReason, orderInvalidField } = validateSellOrder(amountWei, sellOrderExpiryType, sellOrderExpireAfterBlocks )

    const hash = orderHash(orderValid, OrderSide.SELL, expires(OrderSide.SELL), priceControlled, amountControlled, TokenStore.getSelectedToken().address)

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
        hash
    })
}

export function sellOrderExpiryTypeChanged(expiryType) {
    let expireAfterHumanReadableString = OrderPlacementStore.getOrderPlacementState().sellOrderExpireHumanReadableString
    const expireAfterBlocks = OrderPlacementStore.getOrderPlacementState().sellOrderExpireAfterBlocks
    if(expiryType === ExpiryType.BLOCKS) {
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

    const hash = orderHash(
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
        hash,
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

    if(expiryType === ExpiryType.BLOCKS && (expireAfterBlocks === "" || safeBigNumber(expireAfterBlocks).isZero())) {
        orderValid = false
        orderInvalidReason = "Blocks must be greater than zero."
        orderInvalidField = OrderEntryField.BLOCKS
    }

    return { orderValid: orderValid, orderInvalidReason: orderInvalidReason, orderInvalidField }
}

export function buyOrderTypeChanged(orderType) {
    dispatcher.dispatch({
        type: ActionNames.BUY_ORDER_TYPE_CHANGED,
        orderType
    })
}

export function buyOrderPriceChanged(priceControlled) {
    const { buyOrderAmountWei, buyOrderAmountControlled, buyOrderTotalEthControlled, buyOrderExpiryType, buyOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()
    const { totalEthWei, totalEthControlled } = calcTotal(priceControlled, buyOrderAmountWei, buyOrderAmountControlled, buyOrderTotalEthControlled)
    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateBuyOrder(buyOrderAmountWei, totalEthWei, priceControlled, buyOrderAmountControlled, buyOrderTotalEthControlled, buyOrderExpiryType, buyOrderExpireAfterBlocks)

    const hash = orderHash(orderValid, OrderSide.BUY, expires(OrderSide.BUY), priceControlled, buyOrderAmountControlled, TokenStore.getSelectedToken().address)
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
        hash
    })
}

export function buyOrderAmountChanged(buyOrderAmountControlled) {
    const buyOrderAmountWei = tokEthToWei(buyOrderAmountControlled, TokenStore.getSelectedToken().address)
    const { buyOrderPriceControlled, buyOrderTotalEthControlled, buyOrderExpiryType, buyOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()

    const { totalEthWei, totalEthControlled } = calcTotal(buyOrderPriceControlled, buyOrderAmountWei,
        buyOrderAmountControlled, buyOrderTotalEthControlled)
    const { orderValid, orderInvalidReason, orderInvalidField, hasPriceWarning, priceWarning } = validateBuyOrder(buyOrderAmountWei, totalEthWei, buyOrderPriceControlled, buyOrderAmountControlled, buyOrderTotalEthControlled, buyOrderExpiryType, buyOrderExpireAfterBlocks)

    const hash = orderHash(orderValid, OrderSide.BUY, expires(OrderSide.BUY), buyOrderPriceControlled, buyOrderAmountControlled, TokenStore.getSelectedToken().address)

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

    const hash = orderHash(orderValid, OrderSide.BUY, expires(OrderSide.BUY), priceControlled, amountControlled, TokenStore.getSelectedToken().address)

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
        hash
    })
}

export function buyOrderExpiryTypeChanged(expiryType) {
    let expireAfterHumanReadableString = OrderPlacementStore.getOrderPlacementState().buyOrderExpireHumanReadableString
    const expireAfterBlocks = OrderPlacementStore.getOrderPlacementState().buyOrderExpireAfterBlocks
    if(expiryType === ExpiryType.BLOCKS) {
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

    const hash = orderHash(
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
        hash,
        orderValid,
        orderInvalidReason,
        orderInvalidField
    })
}

export function validateBuyOrder(amountWei, totalEthWei, priceControlled, buyOrderAmountControlled, buyOrderTotalEthControlled, expiryType, expireAfterBlocks) {
    const { buyOrderType } = OrderPlacementStore.getOrderPlacementState()
    const exchangeBalanceEthWei = BigNumber(String(AccountStore.getAccountState().exchangeBalanceEthWei))
    let orderValid = true
    let orderInvalidReason = ""
    let orderInvalidField = OrderEntryField.AMOUNT
    if (buyOrderType === OrderType.LIMIT_ORDER && totalEthWei.isGreaterThan(exchangeBalanceEthWei)) {
        orderValid = false
        orderInvalidReason = `Total amount greater than wallet balance (${baseWeiToEth(exchangeBalanceEthWei)} ETH)`
        orderInvalidField = OrderEntryField.TOTAL
    }
    if (buyOrderType === OrderType.MARKET_ORDER) {
        const offerTotalWei = OrderBookStore.getOfferTotal()
        if (amountWei.isGreaterThan(offerTotalWei)) {
            orderValid = false
            orderInvalidReason = `Amount greater than orderbook total offer size (${tokWeiToEth(offerTotalWei, TokenStore.getSelectedToken().address)})`
        }
    }
    if(expiryType === ExpiryType.BLOCKS && (expireAfterBlocks === "" || safeBigNumber(expireAfterBlocks).isZero())) {
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

// if volume is available on the offer, take (aka trade) it (i.e. I am a taker)
// else create a buy order on the bid (i.e. I am a maker)
//
// initially the concept of doing both in one action is unsupported, e.g. take whatever volume is available
// and create an order for the rest. This is because the act of taking/trading is async and not guaranteed to succeed,
// the result of which would drive the subsequent order volume.
export function executeBuy() {
    const tokenAddress = TokenStore.getSelectedToken().address
    const { 
        buyOrderPriceControlled, 
        buyOrderAmountControlled,
        buyOrderTotalEthWei,
        buyOrderAmountWei,
        buyOrderType,
        buyOrderExpiryType,
        buyOrderExpireAfterBlocks,
        buyOrderHash } = OrderPlacementStore.getOrderPlacementState()
    const trades = []
    const expires = buyOrderExpiryType === ExpiryType.GOOD_TILL_CANCEL ? Config.getBlocksGoodTillCancel() : buyOrderExpireAfterBlocks
    // let eligibleOffers = OrderBookStore.getOffers()
    // if (buyOrderType === OrderType.LIMIT_ORDER) {
    //     eligibleOffers = _.filter(OrderBookStore.getOffers(),
    //         (offer) => BigNumber(String(offer.price)).isLessThanOrEqualTo(BigNumber(String(buyOrderPriceControlled))))
    // }
    // let outstandingBaseAmountWei = buyOrderTotalEthWei
    // let outstandingTokAmountWei = buyOrderAmountWei
    // if (buyOrderType === OrderType.MARKET_ORDER) {
    //     outstandingBaseAmountWei = BigNumber(AccountStore.getAccountState().exchangeBalanceEthWei)
    // }
    // const trades = _.flatMap(eligibleOffers, offer => {
    //     let fillAmountWei = BigNumber.minimum(outstandingBaseAmountWei, BigNumber(offer.availableVolumeBase))
    //     if (!fillAmountWei.isZero()) {
    //         if (buyOrderType === OrderType.MARKET_ORDER) {
    //             let fillAmountEth = baseWeiToEth(fillAmountWei)
    //             let fillAmountTok = fillAmountEth.div(BigNumber(String(offer.price)))
    //             const fillAmountTokWei = BigNumber.minimum(outstandingTokAmountWei,
    //                 tokEthToWei(fillAmountTok, tokenAddress))
    //             if (!fillAmountTokWei.isZero()) {
    //                 outstandingTokAmountWei = outstandingTokAmountWei.minus(fillAmountTokWei)

    //                 fillAmountTok = tokWeiToEth(fillAmountTokWei, tokenAddress)
    //                 fillAmountEth = fillAmountTok.times(BigNumber(String(offer.price)))
    //                 fillAmountWei = baseEthToWei(fillAmountEth)

    //                 outstandingBaseAmountWei = outstandingBaseAmountWei.minus(fillAmountWei)
    //                 return [{
    //                     order: offer,
    //                     fillAmountWei: fillAmountWei,
    //                     fillAmountEth: fillAmountEth,
    //                     fillAmountTok: fillAmountTok
    //                 }]
    //             } else {
    //                 return []
    //             }
    //         } else {
    //             outstandingBaseAmountWei = outstandingBaseAmountWei.minus(fillAmountWei)
    //             const fillAmountEth = baseWeiToEth(fillAmountWei)
    //             const fillAmountTok = fillAmountEth.div(BigNumber(String(offer.price)))
    //             return [{
    //                 order: offer,
    //                 fillAmountWei: fillAmountWei,
    //                 fillAmountEth: fillAmountEth,
    //                 fillAmountTok: fillAmountTok
    //             }]
    //         }
    //     } else {
    //         return []
    //     }
    // })
    if (trades.length > 0) {
        dispatcher.dispatch({
            type: ActionNames.EXECUTE_TRADES,
            trades
        })
    } else if (buyOrderType === OrderType.LIMIT_ORDER) {
        const selectedToken = TokenStore.getSelectedToken()
        const order = {
            makerSide: OrderSide.BUY,
            expires: expires,
            price: buyOrderPriceControlled,
            amount: buyOrderAmountControlled,
            tokenAddress: selectedToken.address,
            tokenName: selectedToken.name,
            hash: buyOrderHash
        }
        // dispatcher.dispatch({
        //     type: ActionNames.CREATE_ORDER,
        //     order
        // })
        sendOrder(order)
    }
}

export function executeSell() {
    const { 
        sellOrderPriceControlled,
        sellOrderAmountControlled,
        sellOrderAmountWei,
        sellOrderType,
        sellOrderExpiryType,
        sellOrderExpireAfterBlocks,
        sellOrderHash } = OrderPlacementStore.getOrderPlacementState()
    const trades = []
    const expires = sellOrderExpiryType === ExpiryType.GOOD_TILL_CANCEL ? Config.getBlocksGoodTillCancel() : sellOrderExpireAfterBlocks
    // let eligibleBids = OrderBookStore.getBids()
    // if (sellOrderType === OrderType.LIMIT_ORDER) {
    //     eligibleBids = _.filter(OrderBookStore.getBids(),
    //         (bid) => BigNumber(String(bid.price)).isGreaterThanOrEqualTo(BigNumber(String(sellOrderPriceControlled))))
    // }
    // let outstandingTokAmountWei = sellOrderAmountWei
    // const trades = _.flatMap(eligibleBids, bid => {
    //     const fillAmountWei = BigNumber.minimum(outstandingTokAmountWei, BigNumber(bid.availableVolume))
    //     if (!fillAmountWei.isZero()) {
    //         outstandingTokAmountWei = outstandingTokAmountWei.minus(fillAmountWei)
    //         const fillAmountTok = tokWeiToEth(fillAmountWei, TokenStore.getSelectedToken().address)
    //         const fillAmountEth = fillAmountTok.times(BigNumber(String(bid.price)))
    //         return [{
    //             order: bid,
    //             fillAmountWei: fillAmountWei,
    //             fillAmountTok: fillAmountTok,
    //             fillAmountEth: fillAmountEth
    //         }]
    //     } else {
    //         return []
    //     }
    // })

    if (trades.length > 0) {
        dispatcher.dispatch({
            type: ActionNames.EXECUTE_TRADES,
            trades
        })
    } else if (sellOrderType === OrderType.LIMIT_ORDER) {
        const selectedToken = TokenStore.getSelectedToken()
        const order = {
            makerSide: OrderSide.SELL,
            expires: expires,
            price: sellOrderPriceControlled,
            amount: sellOrderAmountControlled,
            tokenAddress: selectedToken.address,
            tokenName: selectedToken.name,
            hash: sellOrderHash
        }
        // dispatcher.dispatch({
        //     type: ActionNames.CREATE_ORDER,
        //     order
        // })
        sendOrder(order)
    }
}

export function abortTradeExecution() {
    dispatcher.dispatch({
        type: ActionNames.HIDE_EXECUTE_TRADES_MODAL
    })
}

export function abortOrder() {
    dispatcher.dispatch({
        type: ActionNames.HIDE_CREATE_ORDER_MODAL
    })
}

export function confirmTradeExecution() {
    dispatcher.dispatch({
        type: ActionNames.HIDE_EXECUTE_TRADES_MODAL
    })
    const { tradesToExecute } = OrderPlacementStore.getOrderPlacementState()
    const { account, nonce } = AccountStore.getAccountState()
    const gasPriceWei = GasPriceStore.getCurrentGasPriceWei()

    const tradePromises = tradesToExecute.map(trade =>
        EtherDeltaWeb3.promiseTestTrade(account, trade.order, trade.fillAmountWei))
    Promise.all(tradePromises)
        .then(res => {
            if (res.includes(false)) {
                TradeActions.sendTransactionFailed("One or more trades failed to validate as of current block, suggesting the order book might have changed. Please review the order book and re-submit the trade if necessary")
            } else {
                tradesToExecute.forEach((trade, i) => {
                    EtherDeltaWeb3.promiseTrade(account, nonce + i, trade.order, trade.fillAmountWei, gasPriceWei)
                        .once('transactionHash', hash => {
                            AccountActions.nonceUpdated(nonce + 1)
                            MyTradeActions.addMyTrade({
                                environment: Config.getReactEnv(),
                                account: account,
                                txHash: hash,
                                tokenAddress: OrderUtil.tokenAddress(trade.order),
                                side: OrderUtil.takerSide(trade.order), // takerSide
                                price: OrderUtil.priceOf(trade.order),
                                amount: trade.fillAmountTok, // amountTok
                                amountBase: trade.fillAmountEth, // totalEth
                                date: (new Date()).toJSON(),
                                status: TransactionStatus.PENDING
                            })
                        })
                        .on('error', error => { console.log(`failed to trade: ${error.message}`) })
                        .then(receipt => { })
                })
                AccountActions.nonceUpdated(nonce + tradesToExecute.length)
            }
        })
}

export function confirmOrder() {
    dispatcher.dispatch({
        type: ActionNames.HIDE_CREATE_ORDER_MODAL
    })
    sendOrder(OrderPlacementStore.getOrderPlacementState().order)
}

export function expires(makerSide) {
    if(makerSide === OrderSide.BUY) {
        const { buyOrderExpiryType, buyOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()
        return buyOrderExpiryType === ExpiryType.GOOD_TILL_CANCEL ? Config.getBlocksGoodTillCancel() : buyOrderExpireAfterBlocks  
    } else {
        const { sellOrderExpiryType, sellOrderExpireAfterBlocks } = OrderPlacementStore.getOrderPlacementState()
        return sellOrderExpiryType === ExpiryType.GOOD_TILL_CANCEL ? Config.getBlocksGoodTillCancel() : sellOrderExpireAfterBlocks  
    }
}

// NOTE: nonce is randomly generated so this is not referentially transparent
export function orderHash(orderValid, makerSide, expires, price, amount, tokenAddress) {
    if(orderValid && price != "" && amount != "" && expires != "" && expires > 0) {
        const {
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            nonce } = OrderFactory.createUnsignedOrder(makerSide, expires, price, amount, tokenAddress)
        return OrderFactory.orderHash(tokenGet, amountGet, tokenGive, amountGive, expires, nonce)
    } else {
        return ""
    }
}

export function sendOrder(order) {
    const {
        makerSide,
        expires,
        price,
        amount,
        tokenAddress,
        hash
    } = order
    const {
        tokenGet,
        amountGet,
        tokenGive,
        amountGive,
        nonce } = OrderFactory.createUnsignedOrder(makerSide, expires, price, amount, tokenAddress)
    const { account } = AccountStore.getAccountState()
    const contractAddr = Config.getEtherDeltaAddress()
    EtherDeltaWeb3.promiseSignData(hash, account)
        .then(sig => {
            const signedOrderObject = {
                amountGet,
                amountGive,
                tokenGet,
                tokenGive,
                contractAddr,
                expires,
                nonce,
                user: account,
                v: sig.v,
                r: sig.r,
                s: sig.s,
            }
            EtherDeltaSocket.emitOrder(signedOrderObject)
                .then((result) => {
                    if (result && result.status === 202) {
                        OpenOrderActions.addOpenOrder({
                            environment: Config.getReactEnv(),
                            order: signedOrderObject,
                            hash: hash,
                            makerSide: makerSide,
                            tokenAddress: tokenAddress,
                            price: price,
                            amount: amount,
                            state: OrderState.OPEN,
                            pendingCancelTx: null,
                            timestamp: (new Date()).toJSON()
                        })
                    }
                })
        })
}