import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function web3Initialised() {
    dispatcher.dispatch({
        type: ActionNames.WEB3_INITIALISED,
    })
}