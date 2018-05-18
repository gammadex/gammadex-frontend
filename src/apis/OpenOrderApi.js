import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import AccountStore from "../stores/AccountStore"
import * as AccountActions from "../actions/AccountActions"
import Timer from "../util/Timer"
import OrderState from "../OrderState"
import OpenOrdersStore from "../stores/OpenOrdersStore"
import TokenListApi from "./TokenListApi"
import * as GlobalMessageFormatters from "../util/GlobalMessageFormatters"
import * as GlobalMessageActions from "../actions/GlobalMessageActions"
import { tokenAddress } from "../OrderUtil"

export function cancelOpenOrder(openOrder, gasPriceWei) {
    const {account, nonce} = AccountStore.getAccountState()
    const tokenAddr = tokenAddress(openOrder)
    const tokenName = TokenListApi.getTokenName(tokenAddr)

    EtherDeltaWeb3.promiseCancelOrder(account, nonce, openOrder, gasPriceWei)
        .once('transactionHash', hash => {
            AccountActions.nonceUpdated(nonce + 1)
            GlobalMessageActions.sendGlobalMessage(
                GlobalMessageFormatters.getCancelInitiated(tokenName, hash))
        })
        .on('error', error => {
            GlobalMessageActions.sendGlobalMessage(
                GlobalMessageFormatters.getCancelFailed(tokenName, error), "danger")
        })
        .then(receipt => {
            GlobalMessageActions.sendGlobalMessage(GlobalMessageFormatters.getCancelComplete(tokenName), "success")
        })
}
