import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function sendGlobalMessage(content, alertType='primary') {
    dispatcher.dispatch({
        type: ActionNames.GLOBAL_MESSAGE_SENT,
        content,
        alertType,
        time: new Date()
    })
}

export function closeGlobalMessage(id) {
    dispatcher.dispatch({
        type: ActionNames.CLOSE_GLOBAL_MESSAGE,
        id
    })
}