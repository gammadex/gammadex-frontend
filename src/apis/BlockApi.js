import Timer from "../util/Timer"
import * as BlockActions from "../actions/BlockActions"
import LifecycleStore from '../stores/LifecycleStore'
import EtherDeltaWeb3 from "../EtherDeltaWeb3"

export function checkCurrentBlockNumber() {
    return EtherDeltaWeb3.promiseCurrentBlockNumber()
        .then(currentBlockNumber => {
            if (currentBlockNumber !== LifecycleStore.getCurrentBlockNumber()) {
                BlockActions.updateCurrentBlockNumber(currentBlockNumber)
            }
        })
}

export function startCurrentBlockNumberCheckLoop(ms = 2000) {
    checkCurrentBlockNumber()
    Timer.start(checkCurrentBlockNumber, ms)
}

export function stopCurrentBlockNumberCheckLoop() {
    Timer.stop(checkCurrentBlockNumber)
}