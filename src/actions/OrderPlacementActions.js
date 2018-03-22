import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import OrderPlacementStore from "../stores/OrderPlacementStore"
import OrderBookStore from "../stores/OrderBookStore"
import AccountStore from "../stores/AccountStore"
import TokenStore from "../stores/TokenStore"
import BigNumber from 'bignumber.js'
import _ from "lodash"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import * as MockOrderUtil from "../MockOrderUtil"
import * as AccountActions from "./AccountActions"
import * as MyTradeActions from "./MyTradeActions"
import * as TradeActions from "./TradeActions"
import * as OpenOrderActions from "./OpenOrderActions"
import Config from "../Config"
import TransactionStatus from "../TransactionStatus"
import OrderSide from "../OrderSide";
import OrderState from "../OrderState";
import OrderFactory from "../OrderFactory";
import MockSocket from "../MockSocket";
import OrderType from "../OrderType";
import { tokEthToWei, tokWeiToEth, baseEthToWei, baseWeiToEth } from "../EtherConversion"

export function sellOrderTypeChanged(orderType) {
    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_TYPE_CHANGED,
        orderType,
    })
}

// update total when price changed
export function sellOrderPriceChanged(priceControlled) {
    const amountWei = OrderPlacementStore.getOrderPlacementState().sellOrderAmountWei
    const totalEthWei = BigNumber(String(priceControlled)).times(amountWei)
    const totalEthControlled = baseWeiToEth(totalEthWei)
    const { orderValid, orderInvalidReason } = validateSellOrder(amountWei)
    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_PRICE_CHANGED,
        priceControlled,
        totalEthWei,
        totalEthControlled,
        orderValid,
        orderInvalidReason
    })
}

// update total when token amount is changed
export function sellOrderAmountChanged(amountControlled) {
    const amountWei = tokEthToWei(amountControlled, TokenStore.getSelectedToken().address)
    const totalEthWei = BigNumber(String(OrderPlacementStore.getOrderPlacementState().sellOrderPriceControlled)).times(amountWei)
    const totalEthControlled = baseWeiToEth(totalEthWei)
    const { orderValid, orderInvalidReason } = validateSellOrder(amountWei)
    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_AMOUNT_CHANGED,
        amountWei,
        amountControlled,
        totalEthWei,
        totalEthControlled,
        orderValid,
        orderInvalidReason
    })
}

// update amount when total is changed, or zero out if total = 0
export function sellOrderTotalEthChanged(totalEthControlled) {
    const priceControlled = BigNumber(String(OrderPlacementStore.getOrderPlacementState().sellOrderPriceControlled))
    if (priceControlled.isZero()) {
        const zero = BigNumber(0)
        const { orderValid, orderInvalidReason } = validateSellOrder(zero)
        dispatcher.dispatch({
            type: ActionNames.SELL_ORDER_TOTAL_CHANGED,
            amountWei: zero,
            amountControlled: zero,
            totalEthWei: zero,
            totalEthControlled: zero,
            orderValid,
            orderInvalidReason
        })
    } else {
        const amountControlled = BigNumber(String(totalEthControlled)).div(priceControlled)
        const amountWei = tokEthToWei(amountControlled, TokenStore.getSelectedToken().address)
        const totalEthWei = baseEthToWei(totalEthControlled)
        const { orderValid, orderInvalidReason } = validateSellOrder(amountWei)
        dispatcher.dispatch({
            type: ActionNames.SELL_ORDER_TOTAL_CHANGED,
            amountWei,
            amountControlled,
            totalEthWei,
            totalEthControlled,
            orderValid,
            orderInvalidReason
        })
    }
}

// TODO this validation needs to be triggered after: 1) here, 2) wallet balance update, 3) order book update
export function validateSellOrder(amountWei) {
    const tokenAddress = TokenStore.getSelectedToken().address
    const exchangeBalanceTokWei = BigNumber(String(AccountStore.getAccountState().exchangeBalanceTokWei))
    let orderValid = true
    let orderInvalidReason = ""
    if (amountWei.isGreaterThan(exchangeBalanceTokWei)) {
        orderValid = false
        orderInvalidReason = `Amount greater than wallet balance (${tokWeiToEth(exchangeBalanceTokWei, tokenAddress)})`
    }
    const bidTotalWei = OrderBookStore.getBidTotal()
    if (amountWei.isGreaterThan(bidTotalWei)) {
        orderValid = false
        orderInvalidReason = `Amount greater than orderbook total bid size (${tokWeiToEth(bidTotalWei, tokenAddress)})`
    }
    return { orderValid: orderValid, orderInvalidReason: orderInvalidReason }
}

export function buyOrderTypeChanged(orderType) {
    dispatcher.dispatch({
        type: ActionNames.BUY_ORDER_TYPE_CHANGED,
        orderType
    })
}

export function buyOrderPriceChanged(priceControlled) {
    const amountWei = OrderPlacementStore.getOrderPlacementState().buyOrderAmountWei
    const totalEthWei = BigNumber(String(priceControlled)).times(amountWei)
    const totalEthControlled = baseWeiToEth(totalEthWei)
    const { orderValid, orderInvalidReason } = validateBuyOrder(amountWei, totalEthWei)
    dispatcher.dispatch({
        type: ActionNames.BUY_ORDER_PRICE_CHANGED,
        priceControlled,
        totalEthWei,
        totalEthControlled,
        orderValid,
        orderInvalidReason
    })
}

export function buyOrderAmountChanged(amountControlled) {
    const amountWei = tokEthToWei(amountControlled, TokenStore.getSelectedToken().address)
    const totalEthWei = BigNumber(String(OrderPlacementStore.getOrderPlacementState().buyOrderPriceControlled)).times(amountWei)
    const totalEthControlled = baseWeiToEth(totalEthWei)
    const { orderValid, orderInvalidReason } = validateBuyOrder(amountWei, totalEthWei)
    dispatcher.dispatch({
        type: ActionNames.BUY_ORDER_AMOUNT_CHANGED,
        amountWei,
        amountControlled,
        totalEthWei,
        totalEthControlled,
        orderValid,
        orderInvalidReason
    })
}

export function buyOrderTotalEthChanged(totalEthControlled) {
    const priceControlled = BigNumber(String(OrderPlacementStore.getOrderPlacementState().buyOrderPriceControlled))
    if (priceControlled.isZero()) {
        const zero = BigNumber(0)
        const { orderValid, orderInvalidReason } = validateBuyOrder(zero, zero)
        dispatcher.dispatch({
            type: ActionNames.BUY_ORDER_TOTAL_CHANGED,
            amountWei: zero,
            amountControlled: zero,
            totalEthWei: zero,
            totalEthControlled: zero,
            orderValid,
            orderInvalidReason
        })
    } else {
        const amountControlled = BigNumber(String(totalEthControlled)).div(priceControlled)
        const amountWei = tokEthToWei(amountControlled, TokenStore.getSelectedToken().address)
        const totalEthWei = baseEthToWei(totalEthControlled)
        const { orderValid, orderInvalidReason } = validateBuyOrder(amountWei, totalEthWei)
        dispatcher.dispatch({
            type: ActionNames.BUY_ORDER_TOTAL_CHANGED,
            amountWei,
            amountControlled,
            totalEthWei,
            totalEthControlled,
            orderValid,
            orderInvalidReason
        })
    }
}

export function validateBuyOrder(amountWei, totalEthWei) {
    const { buyOrderType } = OrderPlacementStore.getOrderPlacementState()
    const exchangeBalanceEthWei = BigNumber(String(AccountStore.getAccountState().exchangeBalanceEthWei))
    let orderValid = true
    let orderInvalidReason = ""
    if (buyOrderType === OrderType.LIMIT_ORDER && totalEthWei.isGreaterThan(exchangeBalanceEthWei)) {
        orderValid = false
        orderInvalidReason = `Total amount greater than wallet balance (${baseWeiToEth(exchangeBalanceEthWei)} ETH)`
    }
    if (buyOrderType === OrderType.MARKET_ORDER) {
        const offerTotalWei = OrderBookStore.getOfferTotal()
        if (amountWei.isGreaterThan(offerTotalWei)) {
            orderValid = false
            orderInvalidReason = `Amount greater than orderbook total offer size (${tokWeiToEth(offerTotalWei, TokenStore.getSelectedToken().address)})`
        }
    }
    return { orderValid: orderValid, orderInvalidReason: orderInvalidReason }
}

// if volume is available on the offer, take (aka trade) it (i.e. I am a taker)
// else create a buy order on the bid (i.e. I am a maker)
//
// initially the concept of doing both in one action is unsupported, e.g. take whatever volume is available
// and create an order for the rest. This is because the act of taking/trading is async and not guaranteed to succeed,
// the result of which would drive the subsequent order volume.
export function executeBuy() {
    const { buyOrderPriceControlled, buyOrderAmountControlled, buyOrderTotalEthWei, buyOrderType } = OrderPlacementStore.getOrderPlacementState()
    let eligibleOffers = OrderBookStore.getOffers()
    if (buyOrderType === OrderType.LIMIT_ORDER) {
        eligibleOffers = _.filter(OrderBookStore.getOffers(),
            (offer) => BigNumber(String(offer.price)).isLessThanOrEqualTo(BigNumber(String(buyOrderPriceControlled))))
    }
    let outstandingBaseAmountWei = buyOrderTotalEthWei
    if (buyOrderType === OrderType.MARKET_ORDER) {
        outstandingBaseAmountWei = BigNumber(AccountStore.getAccountState().exchangeBalanceEthWei)
    }
    const trades = _.flatMap(eligibleOffers, offer => {
        const fillAmountWei = BigNumber.minimum(outstandingBaseAmountWei, BigNumber(offer.availableVolumeBase))
        if (!fillAmountWei.isZero()) {
            outstandingBaseAmountWei = outstandingBaseAmountWei.minus(fillAmountWei)
            const fillAmountEth = baseWeiToEth(fillAmountWei)
            const fillAmountTok = fillAmountEth.div(BigNumber(String(offer.price)))
            return [{
                order: offer,
                fillAmountWei: fillAmountWei,
                fillAmountEth: fillAmountEth,
                fillAmountTok: fillAmountTok
            }]
        } else {
            return []
        }
    })
    if (trades.length > 0) {
        dispatcher.dispatch({
            type: ActionNames.EXECUTE_TRADES,
            trades
        })
    } else if (buyOrderType === OrderType.LIMIT_ORDER) {
        const selectedToken = TokenStore.getSelectedToken()
        const order = {
            makerSide: OrderSide.BUY,
            expires: 10000000,
            price: buyOrderPriceControlled,
            amount: buyOrderAmountControlled,
            tokenAddress: selectedToken.address,
            tokenName: selectedToken.name
        }
        dispatcher.dispatch({
            type: ActionNames.CREATE_ORDER,
            order
        })
    }
}

export function executeSell() {
    const { sellOrderPriceControlled, sellOrderAmountControlled, sellOrderAmountWei, sellOrderType } = OrderPlacementStore.getOrderPlacementState()
    let eligibleBids = OrderBookStore.getBids()
    if (sellOrderType === OrderType.LIMIT_ORDER) {
        eligibleBids = _.filter(OrderBookStore.getBids(),
            (bid) => BigNumber(String(bid.price)).isGreaterThanOrEqualTo(BigNumber(String(sellOrderPriceControlled))))
    }
    let outstandingTokAmountWei = sellOrderAmountWei
    const trades = _.flatMap(eligibleBids, bid => {
        const fillAmountWei = BigNumber.minimum(outstandingTokAmountWei, BigNumber(bid.availableVolume))
        if (!fillAmountWei.isZero()) {
            outstandingTokAmountWei = outstandingTokAmountWei.minus(fillAmountWei)
            const fillAmountTok = tokWeiToEth(fillAmountWei, TokenStore.getSelectedToken().address)
            const fillAmountEth = fillAmountTok.times(BigNumber(String(bid.price)))
            return [{
                order: bid,
                fillAmountWei: fillAmountWei,
                fillAmountTok: fillAmountTok,
                fillAmountEth: fillAmountEth
            }]
        } else {
            return []
        }
    })
    if (trades.length > 0) {
        dispatcher.dispatch({
            type: ActionNames.EXECUTE_TRADES,
            trades
        })
    } else if (sellOrderType === OrderType.LIMIT_ORDER) {
        const selectedToken = TokenStore.getSelectedToken()
        const order = {
            makerSide: OrderSide.SELL,
            expires: 10000000,
            price: sellOrderPriceControlled,
            amount: sellOrderAmountControlled,
            tokenAddress: selectedToken.address,
            tokenName: selectedToken.name
        }
        dispatcher.dispatch({
            type: ActionNames.CREATE_ORDER,
            order
        })
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
    const tradePromises = tradesToExecute.map(trade =>
        EtherDeltaWeb3.promiseTestTrade(account, trade.order, trade.fillAmountWei))
    Promise.all(tradePromises)
        .then(res => {
            if (res.includes(false)) {
                TradeActions.sendTransactionFailed("One or more trades failed to validate as of current block, suggesting the order book might have changed. Please review the order book and re-submit the trade if necessary")
            } else {
                tradesToExecute.forEach((trade, i) => {
                    EtherDeltaWeb3.promiseTrade(account, nonce + i, trade.order, trade.fillAmountWei)
                        .once('transactionHash', hash => {
                            AccountActions.nonceUpdated(nonce + 1)
                            MyTradeActions.addMyTrade({
                                environment: Config.getReactEnv(),
                                account: account,
                                txHash: hash,
                                tokenAddress: MockOrderUtil.tokenAddress(trade.order),
                                takerSide: MockOrderUtil.takerSide(trade.order),
                                price: MockOrderUtil.priceOf(trade.order),
                                amountTok: trade.fillAmountTok,
                                totalEth: trade.fillAmountEth,
                                timestamp: (new Date()).toJSON(),
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
    const {
        makerSide,
        expires,
        price,
        amount,
        tokenAddress
    } = OrderPlacementStore.getOrderPlacementState().order
    const {
        tokenGet,
        amountGet,
        tokenGive,
        amountGive,
        nonce } = OrderFactory.createUnsignedOrder(makerSide, expires, price, amount, tokenAddress)
    const hash = OrderFactory.orderHash(tokenGet, amountGet, tokenGive, amountGive, expires, nonce)
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
            MockSocket.submitOrder(signedOrderObject)
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
        })
}