import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import AccountStore from "../stores/AccountStore"
import TokenStore from "../stores/TokenStore"
import TradeStore from "../stores/TradeStore"
import GasPriceStore from "../stores/GasPriceStore"
import Config from "../Config"
import * as OrderUtil from "../OrderUtil"
import { tokWeiToEth, baseWeiToEth, baseEthToWei, tokEthToWei, safeBigNumber, weiToEth } from "../EtherConversion"
import BigNumber from 'bignumber.js'
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import * as AccountActions from "../actions/AccountActions"
import * as MyTradeActions from "../actions/MyTradeActions"
import TransactionStatus from "../TransactionStatus"

export function executeTrade(order) {
    // accessing stores from action creator, good practice? Yes, it's ok if just reading.
    // https://discuss.reactjs.org/t/is-accessing-flux-store-from-action-creator-a-good-practice/1717
    const weiFillAmount = BigNumber(order.availableVolume)
    const fillAmountControlled = tokWeiToEth(weiFillAmount, TokenStore.getSelectedToken().address)
    const weiTotalEth = BigNumber(order.availableVolumeBase)
    const totalEthControlled = BigNumber(order.ethAvailableVolumeBase)
    const { fillAmountValid, fillAmountInvalidReason } = validateFillAmount(weiFillAmount, weiTotalEth, order)
    dispatcher.dispatch({
        type: ActionNames.EXECUTE_TRADE,
        order,
        weiFillAmount,
        fillAmountControlled,
        weiTotalEth,
        totalEthControlled,
        fillAmountValid,
        fillAmountInvalidReason
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
    const { fillAmountValid, fillAmountInvalidReason } = validateFillAmount(weiFillAmount, weiTotalEth, order)
    dispatcher.dispatch({
        type: ActionNames.FILL_AMOUNT_CHANGED,
        weiFillAmount,
        fillAmountControlled,
        weiTotalEth,
        totalEthControlled,
        fillAmountValid,
        fillAmountInvalidReason
    })
}

// fillAmount is in order.availableVolume terms = wei units of TOK
export function validateFillAmount(weiFillAmount, weiTotalEth, order) {
    const { exchangeBalanceTokWei, exchangeBalanceEthWei } = AccountStore.getAccountState()
    let fillAmountValid = true
    let fillAmountInvalidReason = ""
    if (weiFillAmount.isZero()) {
        fillAmountValid = false
        fillAmountInvalidReason = "Amount must be greater than zero"
    } else if (weiFillAmount.isGreaterThan(BigNumber(order.availableVolume))) {
        fillAmountValid = false
        fillAmountInvalidReason = `Amount greater than max order amount (${order.ethAvailableVolume})`
    } else if (OrderUtil.isTakerSell(order) && weiFillAmount.isGreaterThan(BigNumber(exchangeBalanceTokWei))) {
        fillAmountValid = false
        fillAmountInvalidReason = `Amount greater than wallet balance (${tokWeiToEth(exchangeBalanceTokWei, TokenStore.getSelectedToken().address)})`
    } else if (OrderUtil.isTakerBuy(order) && weiTotalEth.isGreaterThan(BigNumber(exchangeBalanceEthWei))) {
        fillAmountValid = false
        fillAmountInvalidReason = `Total amount greater than wallet balance (${baseWeiToEth(exchangeBalanceEthWei)} ETH)`
    }
    return { fillAmountValid: fillAmountValid, fillAmountInvalidReason: fillAmountInvalidReason }
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
                            tokenAddress: tokenAddress,
                            takerSide: OrderUtil.takerSide(order),
                            price: order.price,
                            amountTok: fillAmountControlled,
                            totalEth: totalEthControlled,
                            timestamp: (new Date()).toJSON(),
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
    const weiFillAmount = BigNumber(order.availableVolume)
    const fillAmountControlled = tokWeiToEth(weiFillAmount, TokenStore.getSelectedToken().address)
    const weiTotalEth = BigNumber(order.availableVolumeBase)
    const totalEthControlled = BigNumber(order.ethAvailableVolumeBase)
    const { fillAmountValid, fillAmountInvalidReason } = validateFillAmount(weiFillAmount, weiTotalEth, order)
    const fillOrder = {
        order,
        weiFillAmount,
        fillAmountControlled,
        weiTotalEth,
        totalEthControlled,
        fillAmountValid,
        fillAmountInvalidReason
    }
    dispatcher.dispatch({
        type: ActionNames.FILL_ORDER,
        fillOrder
    })
}

export function fillOrderAmountChanged(fillAmountControlled, fillOrder) {
    const order = fillOrder.order
    const weiFillAmount = tokEthToWei(fillAmountControlled, TokenStore.getSelectedToken().address)
    const totalEthControlled = safeBigNumber(fillAmountControlled).times(safeBigNumber(order.price))
    const weiTotalEth = baseEthToWei(totalEthControlled)
    const { fillAmountValid, fillAmountInvalidReason } = validateFillAmount(weiFillAmount, weiTotalEth, order)
    const updatedFillOrder = {
        order,
        weiFillAmount,
        fillAmountControlled,
        weiTotalEth,
        totalEthControlled,
        fillAmountValid,
        fillAmountInvalidReason
    }
    dispatcher.dispatch({
        type: ActionNames.FILL_ORDER_CHANGED,
        updatedFillOrder
    })
}

export function maxFillOrder(fillOrder) {
    if(OrderUtil.isTakerSell(fillOrder.order)) {
        const { exchangeBalanceTokWei } = AccountStore.getAccountState()
        const tokenAmountWei = BigNumber.min(BigNumber(fillOrder.order.availableVolume), BigNumber(exchangeBalanceTokWei))
        fillOrderAmountChanged(tokWeiToEth(tokenAmountWei,TokenStore.getSelectedToken().address), fillOrder)
    } else {
        const { exchangeBalanceEthWei } = AccountStore.getAccountState()
        const exchangeBalanceEth = baseWeiToEth(exchangeBalanceEthWei)
        const tokenAmountEth = exchangeBalanceEth.div(OrderUtil.priceOf(fillOrder.order))
        const tokenAmountWei = BigNumber.min(BigNumber(fillOrder.order.availableVolume), tokEthToWei(tokenAmountEth, TokenStore.getSelectedToken().address))
        fillOrderAmountChanged(tokWeiToEth(tokenAmountWei,TokenStore.getSelectedToken().address), fillOrder)
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