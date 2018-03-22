import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import Config from '../Config'
import _ from "lodash"

class TokenStore extends EventEmitter {
    constructor() {
        super()
        this.selectedToken = Config.getDefaultToken()
        this.searchToken = ""
        this.serverTickers = {}
        this.invalidTokenIdentifier = null
    }

    getSelectedToken() {
        return this.selectedToken
    }

    getSearchToken() {
        return this.searchToken
    }

    getServerTickers() {
        return this.serverTickers
    }

    getInvalidTokenIdentifier() {
        return this.invalidTokenIdentifier
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.SELECT_TOKEN: {
                this.selectedToken = action.token
                this.invalidTokenIdentifier = null
                this.emitChange()
                break
            }
            case ActionNames.SEARCH_TOKEN: {
                this.searchToken = action.search
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_MARKET: {
                if (action.message && action.message.returnTicker) {
                    this.storeServerTickers(action.message.returnTicker)
                    this.emitChange()
                }
                break
            }
            case ActionNames.INVALID_TOKEN: {
                this.invalidTokenIdentifier = action.tokenIdentifier
                this.emitChange()
                break
            }
        }
    }

    storeServerTickers(returnTicker) {
        this.serverTickers =  _.reduce(Object.values(returnTicker), (acc, curr) => {
            acc[curr.tokenAddr.toLowerCase()] = curr
            return acc
        }, {})
    }
}

const tokensStore = new TokenStore()
dispatcher.register(tokensStore.handleActions.bind(tokensStore))

export default tokensStore