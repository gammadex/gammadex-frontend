import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function updateCurrentBlockNumber(currentBlockNumber) {
    dispatcher.dispatch({
        type: ActionNames.CURRENT_BLOCK_NUMBER_UPDATED,
        currentBlockNumber
    })
}
