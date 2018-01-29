import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import Config from '../Config'

class TokenStore extends EventEmitter {
    constructor() {
        super()
        this.selectedToken = Config.getDefaultToken()
    }

    getSelectedToken() {
        return this.selectedToken
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.SELECT_TOKEN: {
                this.selectedToken = action.token
                this.emitChange()
                break
            }
        }
    }
}

const tokensStore = new TokenStore()
dispatcher.register(tokensStore.handleActions.bind(tokensStore))

export default tokensStore