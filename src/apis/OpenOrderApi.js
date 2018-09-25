import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import AccountStore from "../stores/AccountStore"
import * as AccountActions from "../actions/AccountActions"
import Timer from "../util/Timer"
import OrderState from "../OrderState"
import OpenOrdersStore from "../stores/OpenOrdersStore"
import TokenRepository from "../util/TokenRepository"
import * as GlobalMessageFormatters from "../util/GlobalMessageFormatters"
import * as GlobalMessageActions from "../actions/GlobalMessageActions"
import { tokenAddress } from "../OrderUtil"
import ActionNames from "../actions/ActionNames"
import dispatcher from "../dispatcher"
import { setFavourite } from "../util/FavouritesDao"
import Favourites from "../util/Favourites"
import {trackEvent} from '../util/Analytics'
import { safeBigNumber } from "../EtherConversion"

export function requestOrderCancel(openOrder, gasPriceWei) {
    dispatcher.dispatch({
        type: ActionNames.REQUEST_ORDER_CANCEL,
        openOrder,
        gasPriceWei
    })
}

export function hideCancelOrderModal() {
    dispatcher.dispatch({
        type: ActionNames.HIDE_CANCEL_ORDER_MODAL,
    })
}

export function addPendingOrderCancel(id) {
    dispatcher.dispatch({
        type: ActionNames.ADD_PENDING_ORDER_CANCEL,
        id
    })
}

export function removePendingOrderCancel(id) {
    dispatcher.dispatch({
        type: ActionNames.REMOVE_PENDING_ORDER_CANCEL,
        id
    })
}

export function showAllTokensChanged(showAll) {
    setFavourite(Favourites.SHOW_ALL_TOKENS, showAll)
    dispatcher.dispatch({
        type: ActionNames.OPEN_ORDERS_SHOW_ALL_CHANGED,
        showAll
    })
}

export function cancelOpenOrder(openOrder, gasPriceWei) {
    const { account, nonce } = AccountStore.getAccountState()
    const tokenAddr = tokenAddress(openOrder)
    const tokenName = TokenRepository.getTokenName(tokenAddr)

    addPendingOrderCancel(openOrder.id)

    // remove scientific notation
    const safeOpenOrder = Object.assign({}, openOrder, {
        amountGet: safeBigNumber(openOrder.amountGet).toFixed(),
        amountGive: safeBigNumber(openOrder.amountGive).toFixed(),
        expires: safeBigNumber(openOrder.expires).toFixed()
    })

    EtherDeltaWeb3.promiseCancelOrder(account, nonce, safeOpenOrder, gasPriceWei)
        .once('transactionHash', hash => {
            AccountActions.nonceUpdated(nonce + 1)
            GlobalMessageActions.sendGlobalMessage(
                GlobalMessageFormatters.getCancelInitiated(tokenName, hash))
            trackEvent("order","cancel",`${tokenName}:${account}:${hash}`)                
        })
        .on('error', error => {
            GlobalMessageActions.sendGlobalMessage(
                GlobalMessageFormatters.getCancelFailed(tokenName, error), "danger")
            removePendingOrderCancel(openOrder.id)
        })
        .then(receipt => {
            GlobalMessageActions.sendGlobalMessage(GlobalMessageFormatters.getCancelComplete(tokenName), "success")
        })
}
