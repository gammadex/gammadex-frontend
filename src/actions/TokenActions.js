import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function selectToken(token) {
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

export function tokenLookup(address, switchIfFound) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_ADDRESS_LOOKUP,
        address,
        switchIfFound
    })
}

export function addUserToken(token) {
    dispatcher.dispatch({
        type: ActionNames.ADD_USER_TOKEN,
        token
    })
}

export function removeUserToken(token) {
    dispatcher.dispatch({
        type: ActionNames.REMOVE_USER_TOKEN,
        token
    })
}

export function resetCreate(address) {
    dispatcher.dispatch({
        type: ActionNames.RESET_CREATE_TOKEN,
        address
    })
}