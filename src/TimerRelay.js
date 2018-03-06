import { EventEmitter } from "events"
import dispatcher from "./dispatcher"
import ActionNames from "./actions/ActionNames"
import Config from './Config'

class TimerRelay extends EventEmitter {
    constructor() {
        super()
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.TIMER_FIRED: {
                this.emit("change")
                break
            }
        }
    }
}

const timerRelay = new TimerRelay()
dispatcher.register(timerRelay.handleActions.bind(timerRelay))

export default timerRelay