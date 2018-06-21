import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import * as ErrorMessageUtil from "../util/ErrorMessageUtil"

let messageIdCounter = 1

export function sendGlobalMessage(content, alertType = 'primary') {
    const id = messageIdCounter++

    dispatcher.dispatch({
        type: ActionNames.GLOBAL_MESSAGE_SENT,
        content: ErrorMessageUtil.cleanMessage(content),
        alertType,
        time: new Date(),
        id,
    })

    return id
}

export function closeGlobalMessage(id) {
    dispatcher.dispatch({
        type: ActionNames.CLOSE_GLOBAL_MESSAGE,
        id
    })
}