import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function changeDailyVolumeDate(date) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_VOLUME_DAY_CHANGE_DATE,
        date
    })
}

export function changeDailyVolumeDisplayNum(displayNum) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_VOLUME_DAY_CHANGE_DISPLAY_NUM,
        displayNum
    })
}

export function changeDailyVolumeShowOther(isShow) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_VOLUME_DAY_CHANGE_SHOW_OTHER,
        isShow
    })
}

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

export function changeWeeklyVolumeDate(date) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_VOLUME_WEEK_CHANGE_DATE,
        date
    })
}

export function changeWeeklyVolumeDisplayNum(displayNum) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_VOLUME_WEEK_CHANGE_DISPLAY_NUM,
        displayNum
    })
}

export function changeWeeklyVolumeShowOther(isShow) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_VOLUME_WEEK_CHANGE_SHOW_OTHER,
        isShow
    })
}

export function weekVolumeRequested(date) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_VOLUME_WEEK_VOLUME_REQUEST_SENT,
        date
    })
}

export function weekVolumeRequestFailed(error) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_VOLUME_WEEK_VOLUME_REQUEST_FAILED,
        error
    })
}

export function weekVolumeRetrieved(message) {
    dispatcher.dispatch({
        type: ActionNames.TOKEN_VOLUME_WEEK_VOLUME_REQUEST_RETRIEVED,
        message
    })
}
