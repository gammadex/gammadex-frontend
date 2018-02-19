import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

class WalletStore extends EventEmitter {
    constructor() {
        super()
        this.walletType = null
    }

    emitChange() {
        this.emit("change")
    }

    getWalletType() {
        return this.walletType
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.WALLET_SELECTED: {
                this.walletType = action.walletType
                this.emitChange()
                break
            }
        }
    }
}

const walletStore = new WalletStore()
dispatcher.register(walletStore.handleActions.bind(walletStore))

export default walletStore