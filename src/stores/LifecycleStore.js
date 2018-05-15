import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

class LifecycleStore extends EventEmitter {
    constructor() {
        super()
        this.web3Initialised = false
    }

    isWeb3Initialised() {
        return this.web3Initialised
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
        }
    }
}

const lifecycleStore = new LifecycleStore()
dispatcher.register(lifecycleStore.handleActions.bind(lifecycleStore))

export default lifecycleStore