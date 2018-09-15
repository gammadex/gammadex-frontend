import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function dayVolumeRequested(date) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_VOLUME_DAY_VOLUME_REQUEST_SENT,
        date
    })
}

export function dayVolumeRequestFailed(error) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_VOLUME_DAY_VOLUME_REQUEST_FAILED,
        error
    })
}

export function dayVolumeRetrieved(message) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_VOLUME_DAY_VOLUME_REQUEST_RETRIEVED,
        message
    })
}
