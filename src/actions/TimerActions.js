import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function timerFired() {
    dispatcher.dispatch({
        type: ActionNames.TIMER_FIRED
    })
}