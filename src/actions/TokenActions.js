import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function selectToken(name, address) {
    const token = {name, address}
    dispatcher.dispatch({
        type: ActionNames.TOKEN_SELECTED,
        token
    })
}