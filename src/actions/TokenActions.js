import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import Favourites from "../util/Favourites"
import {setFavourite} from "../util/FavouritesDao"

export function selectToken(token) {
    dispatcher.dispatch({
        type: ActionNames.SELECT_TOKEN,
        token
    })

    if (token && token.address) {
        setFavourite(Favourites.RECENT_TOKEN, token.address)
    }
}

export function searchToken(search) {
    dispatcher.dispatch({
        type: ActionNames.SEARCH_TOKEN,
        search
    })
}

export function unlistedTokenAddressLookup(address) {
    dispatcher.dispatch({
        type: ActionNames.UNLISTED_TOKEN_ADDRESS_LOOKUP,
        address,
    })
}

export function unlistedTokenLookupComplete(address, token) {
    dispatcher.dispatch({
        type: ActionNames.UNLISTED_TOKEN_LOOKUP_LOOKUP_COMPLETE,
        address,
        token
    })
}

export function unlistedTokenCheckError(address, error) {
    dispatcher.dispatch({
        type: ActionNames.UNLISTED_TOKEN_CHECK_ERROR,
        address,
        error
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

export function unrecognisedTokenAddressLookup(address) {
    dispatcher.dispatch({
        type: ActionNames.UNRECOGNISED_TOKEN_ADDRESS_LOOKUP,
        address,
    })
}

export function unrecognisedTokenLookupComplete(address, token, error) {
    dispatcher.dispatch({
        type: ActionNames.UNRECOGNISED_TOKEN_LOOKUP_LOOKUP_COMPLETE,
        address,
        token,
        error
    })
}

export function unrecognisedTokenCheckError(address, error) {
    dispatcher.dispatch({
        type: ActionNames.UNRECOGNISED_TOKEN_CHECK_ERROR,
        address,
        error,
    })
}

export function invalidTokenIdentifierInUrl(tokenIdentifier) {
    dispatcher.dispatch({
        type: ActionNames.INVALID_TOKEN_IDENTIFIER_IN_URL,
        tokenIdentifier,
    })
}