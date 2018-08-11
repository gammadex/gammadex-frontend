import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import AccountStore from "../stores/AccountStore"
import TokenStore from "../stores/TokenStore"
import TradeStore from "../stores/TradeStore"
import GasPriceStore from "../stores/GasPriceStore"
import OrderBookStore from "../stores/OrderBookStore"
import Config from "../Config"
import * as OrderUtil from "../OrderUtil"
import {tokWeiToEth, baseWeiToEth, baseEthToWei, tokEthToWei, safeBigNumber, weiToEth} from "../EtherConversion"
import BigNumber from 'bignumber.js'
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import * as AccountActions from "../actions/AccountActions"
import * as OrderPlacementActions from "../actions/OrderPlacementActions"
import * as MyTradeActions from "../actions/MyTradeActions"
import TransactionStatus from "../TransactionStatus"
import OrderEntryField from "../OrderEntryField"
import _ from "lodash"
import OrderSide from "../OrderSide"
import OrderBoxType from "../components/OrderPlacement/OrderBoxType"
import * as GlobalMessageFormatters from "../util/GlobalMessageFormatters"
import * as GlobalMessageActions from "./GlobalMessageActions"
import TokenRepository from "../util/TokenRepository"

// fillAmount is in order.availableVolume terms = wei units of TOK
export function validateFillAmount(weiFillAmount, weiTotalEth, order) {
    const {tradableBalanceTokWei, tradableBalanceEthWei} = AccountStore.getAccountState()
    let fillAmountValid = true
    let fillAmountInvalidReason = ""
    let fillAmountInvalidField = OrderEntryField.AMOUNT
    if (weiFillAmount.isZero()) {
        fillAmountValid = false
        // fillAmountInvalidReason = "Token amount must be greater than zero"
    } else if (weiFillAmount.isGreaterThan(BigNumber(order.availableVolume))) {
        fillAmountValid = false
        fillAmountInvalidReason = `Token amount greater than max order amount (${order.ethAvailableVolume})`
    } else if (OrderUtil.isTakerSell(order) && weiFillAmount.isGreaterThan(BigNumber(tradableBalanceTokWei))) {
        fillAmountValid = false
        fillAmountInvalidReason = `Token amount greater than tradable balance (minus fee) (${tokWeiToEth(tradableBalanceTokWei, TokenStore.getSelectedToken().address)})`
    } else if (OrderUtil.isTakerBuy(order) && weiTotalEth.isGreaterThan(BigNumber(tradableBalanceEthWei))) {
        fillAmountValid = false
        fillAmountInvalidReason = `Total ETH amount greater than tradable balance (minus fee) (${baseWeiToEth(tradableBalanceEthWei)} ETH)`
        fillAmountInvalidField = OrderEntryField.TOTAL
    }
    return {fillAmountValid, fillAmountInvalidReason, fillAmountInvalidField}
}

export function executeOrder(order, weiFillAmount, fillAmountControlled, weiTotalEth, totalEthControlled) {
    const tokenAddress = TokenStore.getSelectedToken().address
    const {account, nonce} = AccountStore.getAccountState()
    const gasPriceWei = GasPriceStore.getCurrentGasPriceWei()

    // amount is in amountGet terms
    let amountWei = 0
    let amount = 0
    let tokenName = 'ETH'
    if (OrderUtil.isTakerSell(order)) {
        // taker is selling, amountWei is in wei units of TOK
        amountWei = weiFillAmount
        amount = tokWeiToEth(amountWei, tokenAddress).toString()
        tokenName = TokenRepository.getTokenName(tokenAddress)
    } else {
        // taker is buying, amountWei in is wei units of ETH
        amountWei = weiTotalEth
        amount = baseWeiToEth(amountWei).toString()
    }
    EtherDeltaWeb3.promiseTestTrade(account, order, amountWei)
        .then(isTradable => {
            if (isTradable) {
                EtherDeltaWeb3.promiseTrade(account, nonce, order, amountWei, gasPriceWei)
                    .once('transactionHash', hash => {
                        AccountActions.nonceUpdated(nonce + 1)
                        let buyer = ""
                        let seller = ""
                        if (OrderUtil.isTakerBuy(order)) {
                            buyer = account
                            seller = order.user
                        } else {
                            buyer = order.user
                            seller = account
                        }
                        MyTradeActions.addMyTrade({
                            environment: Config.getReactEnv(),
                            account: account,
                            txHash: hash,
                            tokenAddr: tokenAddress,
                            side: OrderUtil.takerSide(order),
                            buyer: buyer,
                            seller: seller,
                            price: order.price,
                            amount: fillAmountControlled, // amountTok
                            amountBase: totalEthControlled, // totalEth
                            date: (new Date()).toJSON(),
                            status: TransactionStatus.PENDING
                        })
                        clearFillOrder(OrderUtil.takerSide(order))
                        GlobalMessageActions.sendGlobalMessage(
                            GlobalMessageFormatters.getTradeInitiated(amount, tokenName, hash))
                    })
                    .on('error', error => {
                        GlobalMessageActions.sendGlobalMessage(
                            GlobalMessageFormatters.getTradeFailed(amount, tokenName, error), 'danger')
                    })
                    .then(receipt => {
                        GlobalMessageActions.sendGlobalMessage(
                            GlobalMessageFormatters.getTradeComplete(amount, tokenName), 'success')
                    })
            } else {
                Promise.all([EtherDeltaWeb3.promiseAvailableVolume(order), EtherDeltaWeb3.promiseAmountFilled(order)])
                    .then(res => {
                        const error = `Failed to validate trade as of current block. availableVolume: ${res[0]} amountGet: ${amountWei}  amountFilled: ${res[1]} maker: ${order.user}`
                        GlobalMessageActions.sendGlobalMessage(
                            GlobalMessageFormatters.getTradeFailed(amount, tokenName, error), 'danger')
                    })
            }
        })
}

export function sentTransaction(txHash, takerSide) {
    dispatcher.dispatch({
        type: ActionNames.SENT_TRANSACTION,
        txHash,
        takerSide
    })
}

export function sendTransactionFailed(errorMessage, takerSide) {
    dispatcher.dispatch({
        type: ActionNames.SEND_TRANSACTION_FAILED,
        errorMessage,
        takerSide
    })
}

export function fillOrder(order) {
    // accessing stores from action creator, good practice? Yes, it's ok if just reading.
    // https://discuss.reactjs.org/t/is-accessing-flux-store-from-action-creator-a-good-practice/1717

    const {tradableBalanceEthWei, tradableBalanceTokWei} = AccountStore.getAccountState()

    const availableVolumeBase = BigNumber(order.availableVolumeBase)
    const availableVolume = BigNumber(order.availableVolume)
    let weiFillAmount = null
    let weiTotalEth = null
    if (OrderUtil.isTakerBuy(order)) {
        weiTotalEth = BigNumber.min(tradableBalanceEthWei, availableVolumeBase)
        const fillRatio = weiTotalEth.div(availableVolumeBase)
        weiFillAmount = fillRatio.times(availableVolume)
    } else {
        weiFillAmount = BigNumber.min(tradableBalanceTokWei, availableVolume)
        const fillRatio = weiFillAmount.div(availableVolume)
        weiTotalEth = fillRatio.times(availableVolumeBase)
    }

    const isBestExecution = orderIsBestExecution(order)
    const fillAmountControlled = tokWeiToEth(weiFillAmount, TokenStore.getSelectedToken().address)
    const totalEthControlled = baseWeiToEth(weiTotalEth)
    const {fillAmountValid, fillAmountInvalidReason, fillAmountInvalidField} = validateFillAmount(weiFillAmount, weiTotalEth, order)
    // remove scientific notation
    const safeOrder = Object.assign({}, order, {
        amountGet: safeBigNumber(order.amountGet).toFixed(),
        amountGive: safeBigNumber(order.amountGive).toFixed(),
        expires: safeBigNumber(order.expires).toFixed()
    })
    const fillOrder = {
        order: safeOrder,
        weiFillAmount,
        fillAmountControlled,
        weiTotalEth,
        totalEthControlled,
        fillAmountValid,
        fillAmountInvalidReason,
        fillAmountInvalidField,
        isBestExecution
    }
    dispatcher.dispatch({
        type: ActionNames.FILL_ORDER,
        fillOrder
    })

    if (OrderUtil.isTakerBuy(order)) {
        OrderPlacementActions.focusOnTradeBox(OrderBoxType.BUY)
    } else {
        OrderPlacementActions.focusOnTradeBox(OrderBoxType.SELL)
    }
}

export function orderIsBestExecution(order) {
    if (OrderUtil.isMakerBuy(order)) {
        const orderIndex = (_.findIndex(OrderBookStore.getBids(), {id: order.id}))
        const bestOrderIndex = _.findIndex(OrderBookStore.getBids(), (o) => {
            // The amount check is buggy, commented out as part of #165
            //return BigNumber(o.availableVolume).isGreaterThanOrEqualTo(BigNumber(order.availableVolume)) &&
            return OrderUtil.priceOf(o).isGreaterThanOrEqualTo(OrderUtil.priceOf(order))
        })
        return orderIndex <= bestOrderIndex
    } else {
        const orderIndex = (_.findIndex(OrderBookStore.getOffers(), {id: order.id}))
        const bestOrderIndex = _.findIndex(OrderBookStore.getOffers(), (o) => {
            //return BigNumber(o.availableVolume).isGreaterThanOrEqualTo(BigNumber(order.availableVolume)) &&
            return OrderUtil.priceOf(o).isLessThanOrEqualTo(OrderUtil.priceOf(order))
        })
        return orderIndex <= bestOrderIndex
    }
}

export function fillOrderAmountChanged(fillAmountControlled, fillOrder) {
    const order = fillOrder.order
    const weiFillAmount = tokEthToWei(fillAmountControlled, TokenStore.getSelectedToken().address)
    const totalEthControlled = safeBigNumber(fillAmountControlled).times(safeBigNumber(order.price))
    const weiTotalEth = baseEthToWei(totalEthControlled)

    fillOrderChanged(order, fillAmountControlled, weiFillAmount, weiTotalEth, totalEthControlled)
}

export function fillOrderTotalChanged(totalEthControlled, fillOrder) {
    const order = fillOrder.order
    const fillAmountControlled = safeBigNumber(totalEthControlled).div(safeBigNumber(order.price))
    const weiFillAmount = tokEthToWei(fillAmountControlled, TokenStore.getSelectedToken().address)
    const weiTotalEth = baseEthToWei(totalEthControlled)

    fillOrderChanged(order, fillAmountControlled, weiFillAmount, weiTotalEth, totalEthControlled)
}

function fillOrderChanged(order, fillAmountControlled, weiFillAmount, weiTotalEth, totalEthControlled) {
    const {fillAmountValid, fillAmountInvalidReason, fillAmountInvalidField} = validateFillAmount(weiFillAmount, weiTotalEth, order)
    const isBestExecution = orderIsBestExecution(order)
    const updatedFillOrder = {
        order,
        weiFillAmount,
        fillAmountControlled,
        weiTotalEth,
        totalEthControlled,
        fillAmountValid,
        fillAmountInvalidReason,
        fillAmountInvalidField,
        isBestExecution
    }
    dispatcher.dispatch({
        type: ActionNames.FILL_ORDER_CHANGED,
        updatedFillOrder
    })
}

export function maxFillOrder(fillOrder) {
    fillOrderAmountChanged(tokWeiToEth(getMaximumFillAmountWei(fillOrder.order), TokenStore.getSelectedToken().address), fillOrder)
}

// MAX ( order_available_volume, TOK/ETH_balance)
export function getMaximumFillAmountWei(order) {
    if (OrderUtil.isTakerSell(order)) {
        const {tradableBalanceTokWei} = AccountStore.getAccountState()
        return BigNumber.min(BigNumber(order.availableVolume), BigNumber(tradableBalanceTokWei))
    } else {
        const {tradableBalanceEthWei} = AccountStore.getAccountState()
        const exchangeBalanceEth = baseWeiToEth(tradableBalanceEthWei)
        const tokenAmountEth = exchangeBalanceEth.div(OrderUtil.priceOf(order))
        return BigNumber.min(BigNumber(order.availableVolume), tokEthToWei(tokenAmountEth, TokenStore.getSelectedToken().address))
    }
}

export function executeFillOrder(fillOrder) {
    const tokenAddress = TokenStore.getSelectedToken().address
    const {order, weiFillAmount, fillAmountControlled, weiTotalEth, totalEthControlled} = fillOrder
    executeOrder(order, weiFillAmount, fillAmountControlled, weiTotalEth, totalEthControlled)
}

export function clearFillOrder(takerSide) {
    dispatcher.dispatch({
        type: ActionNames.CLEAR_FILL_ORDER,
        takerSide
    })
}

export function confirmFillOrder(takerSide) {
    dispatcher.dispatch({
        type: ActionNames.CONFIRM_FILL_ORDER,
        takerSide
    })
}

export function hideFillOrderModal() {
    dispatcher.dispatch({
        type: ActionNames.HIDE_FILL_ORDER_MODAL
    })
}