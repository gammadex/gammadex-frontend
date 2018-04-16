import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function gasPricesRetrieved(safeLow, average, fast, fastest, time) {
    dispatcher.dispatch({
        type: ActionNames.GAS_PRICES_RETRIEVED,
        safeLow,
        average,
        fast,
        fastest,
        time
    })
}

export function gasPricesRetrieveError(error) {
    dispatcher.dispatch({
        type: ActionNames.GAS_PRICES_RETRIEVE_ERROR,
        error,
    })
}

