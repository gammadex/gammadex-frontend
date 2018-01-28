import { EventEmitter } from "events";
import dispatcher from "../dispatcher";
import Actions from "../actions/ActionNames"

class TokenStore extends EventEmitter {
    constructor() {
        super()
        this.selectedToken = {}
    }

    getSelectedToken() {
        return this.selectedToken
    }

    emitChange() {
        this.emit("change");
    }

    handleActions(action) {
        switch (action.type) {
            case Actions.TOKEN_SELECTED: {
                this.selectedToken = action.token
                this.emitChange()
                break;
            }
        }
    }
}


const tokensStore = new TokenStore()
dispatcher.register(tokensStore.handleActions.bind(tokensStore))

export default tokensStore