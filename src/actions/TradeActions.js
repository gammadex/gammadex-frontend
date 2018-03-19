import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import AccountStore from "../stores/AccountStore"
import TokenStore from "../stores/TokenStore"
import Config from "../Config";
import * as MockOrderUtil from "../MockOrderUtil"
import OrderSide from "../OrderSide";
import { tokWeiToEth, baseWeiToEth } from "../EtherConversion";

export function executeTrade(order) {
    // accessing stores from action creator, good practice?
    // https://discuss.reactjs.org/t/is-accessing-flux-store-from-action-creator-a-good-practice/1717
    const tokenAddress = TokenStore.getSelectedToken().address
    const { exchangeBalanceTokWei, exchangeBalanceEthWei } = AccountStore.getAccountState()
    const exchangeBalanceTok = tokWeiToEth(exchangeBalanceTokWei, tokenAddress)
    const exchangeBalanceEth = baseWeiToEth(exchangeBalanceEthWei)
    const fillAmount = order.ethAvailableVolume
    const takerSide = MockOrderUtil.takerSide(order)
    const amountEth = fillAmount * order.price
    const { fillAmountValid, fillAmountInvalidReason } = validateFillAmount(
        takerSide, fillAmount, fillAmount, exchangeBalanceTok, amountEth, exchangeBalanceEth)
    dispatcher.dispatch({
        type: ActionNames.EXECUTE_TRADE,
        order,
        fillAmount,
        fillAmountValid,
        fillAmountInvalidReason
    })
}

export function validateFillAmount(takerSide, fillAmount, orderAmount, exchangeBalanceTok, amountEth, exchangeBalanceEth) {
    let fillAmountValid = true
    let fillAmountInvalidReason = ""
    if (fillAmount === 0) {
        fillAmountValid = false
        fillAmountInvalidReason = "Amount must be greater than zero"
    } else if (fillAmount > orderAmount) {
        fillAmountValid = false
        fillAmountInvalidReason = `Amount greater than max order amount (${orderAmount})`
    } else if (takerSide === OrderSide.SELL && fillAmount > exchangeBalanceTok) {
        fillAmountValid = false
        fillAmountInvalidReason = `Amount greater than wallet balance (${exchangeBalanceTok})`
    } else if (takerSide === OrderSide.BUY && amountEth > exchangeBalanceEth) {
        fillAmountValid = false
        fillAmountInvalidReason = `Total amount greater than wallet balance (${exchangeBalanceEth} ETH)`
    }
    return { fillAmountValid: fillAmountValid, fillAmountInvalidReason: fillAmountInvalidReason }
}

export function executeTradeAborted() {
    dispatcher.dispatch({
        type: ActionNames.EXECUTE_TRADE_ABORTED
    })
}

export function fillAmountChanged(takerSide, fillAmount, orderAmount, exchangeBalanceTok, amountEth, exchangeBalanceEth) {
    const { fillAmountValid, fillAmountInvalidReason } = validateFillAmount(
        takerSide, fillAmount, orderAmount, exchangeBalanceTok, amountEth, exchangeBalanceEth)
    dispatcher.dispatch({
        type: ActionNames.FILL_AMOUNT_CHANGED,
        fillAmount,
        fillAmountValid,
        fillAmountInvalidReason
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