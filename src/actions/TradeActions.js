import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import AccountStore from "../stores/AccountStore"
import TokenStore from "../stores/TokenStore"
import Config from "../Config";

export function executeTrade(order) {
    // accessing stores from action creator, good practice?
    // https://discuss.reactjs.org/t/is-accessing-flux-store-from-action-creator-a-good-practice/1717
    const tokenDecimals = Config.getTokenDecimals(TokenStore.getSelectedToken().name)
    const { exchangeBalanceTokWei } = AccountStore.getAccountState()
    const exchangeBalanceTok = exchangeBalanceTokWei / Math.pow(10, tokenDecimals)
    const fillAmount = order.ethAvailableVolume
    const { fillAmountValid, fillAmountInvalidReason } = validateFillAmount(fillAmount, fillAmount, exchangeBalanceTok)
    dispatcher.dispatch({
        type: ActionNames.EXECUTE_TRADE,
        order,
        fillAmount,
        fillAmountValid,
        fillAmountInvalidReason
    })
}

export function validateFillAmount(fillAmount, orderAmount, exchangeBalanceTok) {
    let fillAmountValid = true
    let fillAmountInvalidReason = ""
    if (fillAmount === 0) {
        fillAmountValid = false
        fillAmountInvalidReason = "Amount must be greater than zero"
    } else if (fillAmount > orderAmount) {
        fillAmountValid = false
        fillAmountInvalidReason = `Amount greater than max order amount (${orderAmount})`
    } else if (fillAmount > exchangeBalanceTok) {
        fillAmountValid = false
        fillAmountInvalidReason = `Amount greater than wallet balance (${exchangeBalanceTok})`
    }
    return { fillAmountValid: fillAmountValid, fillAmountInvalidReason: fillAmountInvalidReason }
}

export function executeTradeAborted() {
    dispatcher.dispatch({
        type: ActionNames.EXECUTE_TRADE_ABORTED
    })
}

export function fillAmountChanged(fillAmount, orderAmount, exchangeBalanceTok) {
    const { fillAmountValid, fillAmountInvalidReason } = validateFillAmount(fillAmount, orderAmount, exchangeBalanceTok)
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