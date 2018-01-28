import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function loadConfig() {
    dispatcher.dispatch({
        type: ActionNames.LOAD_CONFIG
    })
}

