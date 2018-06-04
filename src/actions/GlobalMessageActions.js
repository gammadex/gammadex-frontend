import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import * as ErrorMessageUtil from "../util/ErrorMessageUtil"

export function sendGlobalMessage(content, alertType = 'primary') {
    dispatcher.dispatch({
        type: ActionNames.GLOBAL_MESSAGE_SENT,
        content: ErrorMessageUtil.cleanMessage(content),
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