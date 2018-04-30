import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import Config from '../Config'
import _ from "lodash"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"

class TokenStore extends EventEmitter {
    constructor() {
        super()
        this.selectedToken = Config.getDefaultToken()
        this.searchToken = ""
        this.serverTickers = {}
        this.invalidTokenIdentifier = null
        this.createToken = {
            address: "",
            lName: "",
            name: "",
            decimals: ""
        }
        this.tokenCheckError = ""
        this.checkingAddress = false
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

    getCreateToken() {
        return this.createToken
    }

    isCheckingAddress() {
        return this.checkingAddress
    }

    getTokenCheckError() {
        return this.tokenCheckError
    }

    emitChange() {
        this.emit("change")
    }

    checkAddress = address => {
        EtherDeltaWeb3.promiseGetTokenDetails(address)
            .then(res => {
                this.createToken.address = address
                this.createToken.lName = res[0]
                this.createToken.name = res[1]
                this.createToken.decimals = res[2]
                this.tokenCheckError = ""
                this.checkingAddress = false
                this.emitChange()
            })
            .catch(e => {
                this.createToken.address = address
                this.createToken.lName = ""
                this.createToken.name = ""
                this.createToken.decimals = ""
                this.tokenCheckError = "Invalid Address"
                this.checkingAddress = false
                this.emitChange()
            })
        
        this.checkingAddress = true
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
            case ActionNames.TOKEN_ADDRESS_LOOKUP: {
                this.checkAddress(action.address)
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