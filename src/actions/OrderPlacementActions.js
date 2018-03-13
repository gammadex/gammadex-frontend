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
import Config from "../Config"
import TradeStatus from "../TradeStatus"

export function sellOrderTypeChanged(orderType) {
    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_TYPE_CHANGED,
        orderType,
    })
}

export function sellOrderChanged(price, amount, total, exchangeBalanceTok) {
    let orderValid = true
    let orderInvalidReason = ""
    if (amount > exchangeBalanceTok) {
        orderValid = false
        orderInvalidReason = `Amount greater than wallet balance (${exchangeBalanceTok})`
    }
    dispatcher.dispatch({
        type: ActionNames.SELL_ORDER_CHANGED,
        price,
        amount,
        total,
        orderValid,
        orderInvalidReason
    })
}

export function buyOrderTypeChanged(orderType) {
    dispatcher.dispatch({
        type: ActionNames.BUY_ORDER_TYPE_CHANGED,
        orderType
    })
}

export function buyOrderChanged(price, amount, total, exchangeBalanceEth) {
    let orderValid = true
    let orderInvalidReason = ""
    if (total > exchangeBalanceEth) {
        orderValid = false
        orderInvalidReason = `Total amount greater than wallet balance (${exchangeBalanceEth} ETH)`
    }
    dispatcher.dispatch({
        type: ActionNames.BUY_ORDER_CHANGED,
        price,
        amount,
        total,
        orderValid,
        orderInvalidReason
    })
}

// if volume is available on the offer, take (aka trade) it (i.e. I am a taker)
// else create a buy order on the bid (i.e. I am a maker)
//
// initially the concept of doing both in one action is unsupported, e.g. take whatever volume is available
// and create an order for the rest. This is because the act of taking/trading is async and not guaranteed to succeed,
// the result of which would drive the order volume.
export function executeBuy() {
    const { buyOrderPrice, buyOrderTotal } = OrderPlacementStore.getOrderPlacementState()
    const eligibleOffers = _.filter(OrderBookStore.getOffers(),
        (offer) => parseFloat(offer.price) <= buyOrderPrice)
    // TODO this is really bad use of String -> Number -> BigNumber
    // which can result in Error: [BigNumber Error] Number primitive has more than 15 significant digits: 0.00005518027643333333
    // https://github.com/wjsrobertson/ethergamma/issues/6
    let outstandingBaseAmountWei = BigNumber(buyOrderTotal).multipliedBy(BigNumber(Math.pow(10, 18)))
    const trades = _.flatMap(eligibleOffers, offer => {
        const fillAmountWei = BigNumber.minimum(outstandingBaseAmountWei, BigNumber(offer.availableVolumeBase))
        if (!fillAmountWei.isZero()) {
            outstandingBaseAmountWei = outstandingBaseAmountWei.minus(fillAmountWei)
            const fillAmountEth = fillAmountWei / Math.pow(10, 18)
            const fillAmountTok = fillAmountEth / offer.price
            // TODO, do we need orderDetail here or can we just use the socket order
            return [{
                orderDetail: MockOrderUtil.orderDetailFromOrder(offer),
                fillAmountWei: fillAmountWei,
                fillAmountEth: fillAmountEth,
                fillAmountTok: fillAmountTok
            }]
        } else {
            return []
        }
    })
    if (trades.length === 0) {
        console.log("prompt user to create new order on book")
    } else {
        dispatcher.dispatch({
            type: ActionNames.EXECUTE_TRADES,
            trades
        })
    }
}

export function executeSell() {
    const { sellOrderPrice, sellOrderAmount } = OrderPlacementStore.getOrderPlacementState()
    const eligibleBids = _.filter(OrderBookStore.getBids(),
        (bid) => parseFloat(bid.price) >= sellOrderPrice)
    const tokenDecimals = Config.getTokenDecimals(TokenStore.getSelectedToken().name)
    let outstandingTokAmountWei = BigNumber(sellOrderAmount).multipliedBy(BigNumber(Math.pow(10, tokenDecimals)))
    const trades = _.flatMap(eligibleBids, bid => {
        const fillAmountWei = BigNumber.minimum(outstandingTokAmountWei, BigNumber(bid.availableVolume))
        if (!fillAmountWei.isZero()) {
            outstandingTokAmountWei = outstandingTokAmountWei.minus(fillAmountWei)
            const fillAmountTok = fillAmountWei / Math.pow(10, tokenDecimals)
            const fillAmountEth = fillAmountTok * bid.price
            return [{ orderDetail: MockOrderUtil.orderDetailFromOrder(bid), 
                fillAmountWei: fillAmountWei,
                fillAmountTok: fillAmountTok,
                fillAmountEth: fillAmountEth
             }]
        } else {
            return []
        }
    })
    if (trades.length === 0) {
        console.log("prompt user to create new order on book")
    } else {
        dispatcher.dispatch({
            type: ActionNames.EXECUTE_TRADES,
            trades
        })
    }
}

export function abortTradeExecution() {
    dispatcher.dispatch({
        type: ActionNames.HIDE_EXECUTE_TRADES_MODAL
    })
}

export function confirmTradeExecution() {
    dispatcher.dispatch({
        type: ActionNames.HIDE_EXECUTE_TRADES_MODAL
    })
    const { tradesToExecute } = OrderPlacementStore.getOrderPlacementState()
    const { account, nonce } = AccountStore.getAccountState()
    const tradePromises = tradesToExecute.map(trade => {
        return EtherDeltaWeb3.promiseTestTrade(account, trade.orderDetail.order, trade.fillAmountWei)
    })
    Promise.all(tradePromises)
        .then(res => {
            if (res.includes(false)) {
                TradeActions.sendTransactionFailed("One or more trades failed to validate as of current block, suggesting the order book might have changed. Please review the order book and re-submit the trade if necessary")
            } else {
                tradesToExecute.forEach((trade, i) => {
                    EtherDeltaWeb3.promiseTrade(account, nonce + i, trade.orderDetail.order, trade.fillAmountWei)
                        .once('transactionHash', hash => {
                            AccountActions.nonceUpdated(nonce + 1)
                            //TradeActions.sentTransaction(hash)
                            MyTradeActions.addMyTrade({
                                environment: Config.getReactEnv(),
                                account: account,
                                txHash: hash,
                                tokenAddress: MockOrderUtil.tokenAddress(trade.orderDetail.order),
                                takerSide: MockOrderUtil.takerSide(trade.orderDetail.order),
                                price: trade.orderDetail.price,
                                amountTok: trade.fillAmountTok,
                                totalEth: trade.fillAmountEth,
                                timestamp: (new Date()).toJSON(),
                                status: TradeStatus.PENDING
                            })
                        })
                        .on('error', error => { console.log(`failed to trade: ${error.message}`) })
                        .then(receipt => { })
                })
                AccountActions.nonceUpdated(nonce + tradesToExecute.length)
            }
        })
}