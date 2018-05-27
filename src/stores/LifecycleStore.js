import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

class LifecycleStore extends EventEmitter {
    constructor() {
        super()
        this.web3Initialised = false
        this.currentBlockNumber = null
    }

    isWeb3Initialised() {
        return this.web3Initialised
    }

    getCurrentBlockNumber() {
        return this.currentBlockNumber
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.WEB3_INITIALISED: {
                this.web3Initialised = true
                this.emitChange()
                break
            }
            case ActionNames.CURRENT_BLOCK_NUMBER_UPDATED: {
                this.currentBlockNumber = action.currentBlockNumber
                this.emitChange()
                break
            }
        }
    }
}

const lifecycleStore = new LifecycleStore()
dispatcher.register(lifecycleStore.handleActions.bind(lifecycleStore))

export default lifecycleStore