import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function gasPricesRetrieved(safeLowWei, averageWei, fastWei, fastestWei, time) {
    dispatcher.dispatch({
        type: ActionNames.GAS_PRICES_RETRIEVED,
        safeLowWei,
        averageWei,
        fastWei,
        fastestWei,
        time
    })
}

export function gasPricesRetrieveError(error) {
    dispatcher.dispatch({
        type: ActionNames.GAS_PRICES_RETRIEVE_ERROR,
        error,
    })
}

export function setCurrentGasPrice(currentPriceWei) {
    dispatcher.dispatch({
        type: ActionNames.GAS_PRICES_SET_CURRENT_PRICE_WEI,
        currentPriceWei,
    })
}
