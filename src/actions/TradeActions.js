import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import AccountStore from "../stores/AccountStore"
import TokenStore from "../stores/TokenStore"
import TradeStore from "../stores/TradeStore"
import GasPriceStore from "../stores/GasPriceStore"
import Config from "../Config"
import * as MockOrderUtil from "../MockOrderUtil"
import { tokWeiToEth, baseWeiToEth, baseEthToWei, tokEthToWei } from "../EtherConversion"
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
    } else if (MockOrderUtil.isTakerSell(order) && weiFillAmount.isGreaterThan(BigNumber(exchangeBalanceTokWei))) {
        fillAmountValid = false
        fillAmountInvalidReason = `Amount greater than wallet balance (${tokWeiToEth(exchangeBalanceTokWei, TokenStore.getSelectedToken().address)})`
    } else if (MockOrderUtil.isTakerBuy(order) && weiTotalEth.isGreaterThan(BigNumber(exchangeBalanceEthWei))) {
        fillAmountValid = false
        fillAmountInvalidReason = `Total amount greater than wallet balance (${baseWeiToEth(exchangeBalanceEthWei)} ETH)`
    }
    return { fillAmountValid: fillAmountValid, fillAmountInvalidReason: fillAmountInvalidReason }
}

export function tradeExecutionConfirmed() {
    const tokenAddress = TokenStore.getSelectedToken().address
    const { modalOrder, weiFillAmount, fillAmountControlled, weiTotalEth, totalEthControlled } = TradeStore.getTradeState()
    const { account, nonce } = AccountStore.getAccountState()
    const gasPriceWei = GasPriceStore.getCurrentGasPriceWei()

    // amount is in amountGet terms
    let amountWei = 0
    if (MockOrderUtil.isTakerSell(modalOrder)) {
        // taker is selling, amountWei is in wei units of TOK
        amountWei = weiFillAmount
    } else {
        // taker is buying, amountWei in is wei units of ETH
        amountWei = weiTotalEth
    }
    EtherDeltaWeb3.promiseTestTrade(account, modalOrder, amountWei)
        .then(isTradable => {
            if (isTradable) {
                EtherDeltaWeb3.promiseTrade(account, nonce, modalOrder, amountWei, gasPriceWei)
                    .once('transactionHash', hash => {
                        AccountActions.nonceUpdated(nonce + 1)
                        sentTransaction(hash)
                        MyTradeActions.addMyTrade({
                            environment: Config.getReactEnv(),
                            account: account,
                            txHash: hash,
                            tokenAddress: tokenAddress,
                            takerSide: MockOrderUtil.takerSide(modalOrder),
                            price: modalOrder.price,
                            amountTok: fillAmountControlled,
                            totalEth: totalEthControlled,
                            timestamp: (new Date()).toJSON(),
                            status: TransactionStatus.PENDING
                        })
                    })
                    .on('error', error => { console.log(`failed to trade: ${error.message}`) })
                    .then(receipt => { }) // when tx is mined - we regularly poll the blockchain so this can be empty here
            } else {
                Promise.all([EtherDeltaWeb3.promiseAvailableVolume(modalOrder), EtherDeltaWeb3.promiseAmountFilled(modalOrder)])
                    .then(res => {
                        sendTransactionFailed(`Failed to validate trade as of current block. availableVolume: ${res[0]} amountGet: ${amountWei}  amountFilled: ${res[1]} maker: ${modalOrder.user}`)
                    })
            }
        })
}

export function sentTransaction(txHash) {
    dispatcher.dispatch({
        type: ActionNames.SENT_TRANSACTION,
        txHash
    })
}

export function sendTransactionFailed(errorMessage) {
    dispatcher.dispatch({
        type: ActionNames.SEND_TRANSACTION_FAILED,
        errorMessage
    })
}

export function hideTransactionModal() {
    dispatcher.dispatch({
        type: ActionNames.HIDE_TRANSACTION_MODAL
    })
}