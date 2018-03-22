import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function selectToken(name, address) {
    const token = {name, address}
    dispatcher.dispatch({
        type: ActionNames.SELECT_TOKEN,
        token
    })
}

export function searchToken(search) {
    dispatcher.dispatch({
        type: ActionNames.SEARCH_TOKEN,
        search
    })
}

export function invalidToken(tokenIdentifier) {
    dispatcher.dispatch({
        type: ActionNames.INVALID_TOKEN,
        tokenIdentifier
    })
}