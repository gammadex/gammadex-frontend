import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function changeBidsPage(page) {
    dispatcher.dispatch({
        type: ActionNames.CHANGE_BIDS_PAGE,
        page
    })
}

export function changeOffersPage(page) {
    dispatcher.dispatch({
        type: ActionNames.CHANGE_OFFERS_PAGE,
        page
    })
}

export function changeTradesPage(page) {
    dispatcher.dispatch({
        type: ActionNames.CHANGE_TRADES_PAGE,
        page
    })
}