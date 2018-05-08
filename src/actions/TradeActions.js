import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import AccountStore from "../stores/AccountStore"
import TokenStore from "../stores/TokenStore"
import TradeStore from "../stores/TradeStore"
import GasPriceStore from "../stores/GasPriceStore"
import OrderBookStore from "../stores/OrderBookStore"
import Config from "../Config"
import * as OrderUtil from "../OrderUtil"
import { tokWeiToEth, baseWeiToEth, baseEthToWei, tokEthToWei, safeBigNumber, weiToEth } from "../EtherConversion"
import BigNumber from 'bignumber.js'
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import * as AccountActions from "../actions/AccountActions"
import * as MyTradeActions from "../actions/MyTradeActions"
import TransactionStatus from "../TransactionStatus"
import FillOrderField from "../FillOrderField"
import _ from "lodash"
import OrderSide from "../OrderSide"

export function executeTrade(order) {
    // accessing stores from action creator, good practice? Yes, it's ok if just reading.
    // https://discuss.reactjs.org/t/is-accessing-flux-store-from-action-creator-a-good-practice/1717
    const weiFillAmount = BigNumber(order.availableVolume)
    const fillAmountControlled = tokWeiToEth(weiFillAmount, TokenStore.getSelectedToken().address)
    const weiTotalEth = BigNumber(order.availableVolumeBase)
    const totalEthControlled = BigNumber(order.ethAvailableVolumeBase)
    const { fillAmountValid, fillAmountInvalidReason, fillAmountInvalidField } = validateFillAmount(weiFillAmount, weiTotalEth, order)
    dispatcher.dispatch({
        type: ActionNames.EXECUTE_TRADE,
        order,
        weiFillAmount,
        fillAmountControlled,
        weiTotalEth,
        totalEthControlled,
        fillAmountValid,
        fillAmountInvalidReason,
        fillAmountInvalidField
    })
}

export function executeTradeAborted() {
    dispatcher.dispatch({
        type: ActionNames.EXECUTE_TRADE_ABORTED
    })
}

export function changedFillAmountControlled(fillAmountControlled) {
    const order = TradeStore.getTradeState().modalOrder
    const weiFillAmount = tokEthToWei(fillAmountControlled, TokenStore.getSelectedToken().address)
    const totalEthControlled = BigNumber(String(fillAmountControlled)).times(BigNumber(String(order.price)))
    const weiTotalEth = baseEthToWei(totalEthControlled)
    const { fillAmountValid, fillAmountInvalidReason, fillAmountInvalidField } = validateFillAmount(weiFillAmount, weiTotalEth, order)
    dispatcher.dispatch({
        type: ActionNames.FILL_AMOUNT_CHANGED,
        weiFillAmount,
        fillAmountControlled,
        weiTotalEth,
        totalEthControlled,
        fillAmountValid,
        fillAmountInvalidReason,
        fillAmountInvalidField
    })
}

// fillAmount is in order.availableVolume terms = wei units of TOK
export function validateFillAmount(weiFillAmount, weiTotalEth, order) {
    const { exchangeBalanceTokWei, exchangeBalanceEthWei } = AccountStore.getAccountState()
    let fillAmountValid = true
    let fillAmountInvalidReason = ""
    let fillAmountInvalidField = FillOrderField.AMOUNT
    if (weiFillAmount.isZero()) {
        fillAmountValid = false
        fillAmountInvalidReason = "Token amount must be greater than zero"
    } else if (weiFillAmount.isGreaterThan(BigNumber(order.availableVolume))) {
        fillAmountValid = false
        fillAmountInvalidReason = `Token amount greater than max order amount (${order.ethAvailableVolume})`
    } else if (OrderUtil.isTakerSell(order) && weiFillAmount.isGreaterThan(BigNumber(exchangeBalanceTokWei))) {
        fillAmountValid = false
        fillAmountInvalidReason = `Token amount greater than wallet balance (${tokWeiToEth(exchangeBalanceTokWei, TokenStore.getSelectedToken().address)})`
    } else if (OrderUtil.isTakerBuy(order) && weiTotalEth.isGreaterThan(BigNumber(exchangeBalanceEthWei))) {
        fillAmountValid = false
        fillAmountInvalidReason = `Total ETH amount greater than wallet balance (${baseWeiToEth(exchangeBalanceEthWei)} ETH)`
        fillAmountInvalidField = FillOrderField.TOTAL
    }
    return { fillAmountValid, fillAmountInvalidReason, fillAmountInvalidField }
}

export function tradeExecutionConfirmed() {
    const { modalOrder, weiFillAmount, fillAmountControlled, weiTotalEth, totalEthControlled } = TradeStore.getTradeState()
    executeOrder(modalOrder, weiFillAmount, fillAmountControlled, weiTotalEth, totalEthControlled)
}

export function executeOrder(order, weiFillAmount, fillAmountControlled, weiTotalEth, totalEthControlled) {
    const tokenAddress = TokenStore.getSelectedToken().address
    const { account, nonce } = AccountStore.getAccountState()
    const gasPriceWei = GasPriceStore.getCurrentGasPriceWei()

    // amount is in amountGet terms
    let amountWei = 0
    if (OrderUtil.isTakerSell(order)) {
        // taker is selling, amountWei is in wei units of TOK
        amountWei = weiFillAmount
    } else {
        // taker is buying, amountWei in is wei units of ETH
        amountWei = weiTotalEth
    }
    EtherDeltaWeb3.promiseTestTrade(account, order, amountWei)
        .then(isTradable => {
            if (isTradable) {
                EtherDeltaWeb3.promiseTrade(account, nonce, order, amountWei, gasPriceWei)
                    .once('transactionHash', hash => {
                        AccountActions.nonceUpdated(nonce + 1)
                        sentTransaction(hash, OrderUtil.takerSide(order))
                        MyTradeActions.addMyTrade({
                            environment: Config.getReactEnv(),
                            account: account,
                            txHash: hash,
                            tokenAddr: tokenAddress,
                            side: OrderUtil.takerSide(order),
                            price: order.price,
                            amount: fillAmountControlled, // amountTok
                            amountBase: totalEthControlled, // totalEth
                            date: (new Date()).toJSON(),
                            status: TransactionStatus.PENDING
                        })
                    })
                    .on('error', error => { console.log(`failed to trade: ${error.message}`) })
                    .then(receipt => { }) // when tx is mined - we regularly poll the blockchain so this can be empty here
            } else {
                Promise.all([EtherDeltaWeb3.promiseAvailableVolume(order), EtherDeltaWeb3.promiseAmountFilled(order)])
                    .then(res => {
                        sendTransactionFailed(
                            `Failed to validate trade as of current block. availableVolume: ${res[0]} amountGet: ${amountWei}  amountFilled: ${res[1]} maker: ${order.user}`,
                            OrderUtil.takerSide(order))
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

export function hideTransactionModal() {
    dispatcher.dispatch({
        type: ActionNames.HIDE_TRANSACTION_MODAL
    })
}

// ==== Experimental Order Book ====

export function fillOrder(order) {
    // accessing stores from action creator, good practice? Yes, it's ok if just reading.
    // https://discuss.reactjs.org/t/is-accessing-flux-store-from-action-creator-a-good-practice/1717

    if (OrderUtil.isTakerBuy(order) &&
        TradeStore.getTradeState().fillOrderTakerBuy &&
        TradeStore.getTradeState().fillOrderTakerBuy.order.id === order.id) {
        clearFillOrder(OrderSide.BUY)
        return
    }

    if (OrderUtil.isTakerSell(order) &&
        TradeStore.getTradeState().fillOrderTakerSell &&
        TradeStore.getTradeState().fillOrderTakerSell.order.id === order.id) {
        clearFillOrder(OrderSide.SELL)
        return
    }

    const isBestExecution = orderIsBestExecution(order)
    const weiFillAmount = BigNumber(order.availableVolume)
    const fillAmountControlled = tokWeiToEth(weiFillAmount, TokenStore.getSelectedToken().address)
    const weiTotalEth = BigNumber(order.availableVolumeBase)
    const totalEthControlled = BigNumber(order.ethAvailableVolumeBase)
    const { fillAmountValid, fillAmountInvalidReason, fillAmountInvalidField } = validateFillAmount(weiFillAmount, weiTotalEth, order)
    const fillOrder = {
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
        type: ActionNames.FILL_ORDER,
        fillOrder
    })
}

export function orderIsBestExecution(order) {
    if (OrderUtil.isMakerBuy(order)) {
        const orderIndex = (_.findIndex(OrderBookStore.getBids(), { id: order.id }))
        const bestOrderIndex = _.findIndex(OrderBookStore.getBids(), (o) => {
            return BigNumber(o.availableVolume).isGreaterThanOrEqualTo(BigNumber(order.availableVolume)) &&
                OrderUtil.priceOf(o).isGreaterThanOrEqualTo(OrderUtil.priceOf(order))
        })
        return orderIndex <= bestOrderIndex
    } else {
        const orderIndex = (_.findIndex(OrderBookStore.getOffers(), { id: order.id }))
        const bestOrderIndex = _.findIndex(OrderBookStore.getOffers(), (o) => {
            return BigNumber(o.availableVolume).isGreaterThanOrEqualTo(BigNumber(order.availableVolume)) &&
                OrderUtil.priceOf(o).isLessThanOrEqualTo(OrderUtil.priceOf(order))
        })
        return orderIndex <= bestOrderIndex
    }
}

export function fillOrderAmountChanged(fillAmountControlled, fillOrder) {
    const order = fillOrder.order
    const weiFillAmount = tokEthToWei(fillAmountControlled, TokenStore.getSelectedToken().address)
    const totalEthControlled = safeBigNumber(fillAmountControlled).times(safeBigNumber(order.price))
    const weiTotalEth = baseEthToWei(totalEthControlled)
    const { fillAmountValid, fillAmountInvalidReason, fillAmountInvalidField } = validateFillAmount(weiFillAmount, weiTotalEth, order)
    const updatedFillOrder = {
        order,
        weiFillAmount,
        fillAmountControlled,
        weiTotalEth,
        totalEthControlled,
        fillAmountValid,
        fillAmountInvalidReason,
        fillAmountInvalidField,
        isBestExecution: true // TODO
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
        const { exchangeBalanceTokWei } = AccountStore.getAccountState()
        return BigNumber.min(BigNumber(order.availableVolume), BigNumber(exchangeBalanceTokWei))
    } else {
        const { exchangeBalanceEthWei } = AccountStore.getAccountState()
        const exchangeBalanceEth = baseWeiToEth(exchangeBalanceEthWei)
        const tokenAmountEth = exchangeBalanceEth.div(OrderUtil.priceOf(order))
        return BigNumber.min(BigNumber(order.availableVolume), tokEthToWei(tokenAmountEth, TokenStore.getSelectedToken().address))
    }
}

export function executeFillOrder(fillOrder) {
    const tokenAddress = TokenStore.getSelectedToken().address
    const { order, weiFillAmount, fillAmountControlled, weiTotalEth, totalEthControlled } = fillOrder
    executeOrder(order, weiFillAmount, fillAmountControlled, weiTotalEth, totalEthControlled)
}

export function dismissTransactionAlert(takerSide) {
    dispatcher.dispatch({
        type: ActionNames.DISMISS_TRANSACTION_ALERT,
        takerSide
    })
}

export function clearFillOrder(takerSide) {
    dispatcher.dispatch({
        type: ActionNames.CLEAR_FILL_ORDER,
        takerSide
    })
}