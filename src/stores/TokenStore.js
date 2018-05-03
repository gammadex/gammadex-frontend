import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import _ from "lodash"
import TokenListApi from "../apis/TokenListApi"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import WalletStore from "./WalletStore"

class TokenStore extends EventEmitter {
    constructor() {
        super()
        this.selectedToken = TokenListApi.getDefaultToken()
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

    getUserTokens() {
        return TokenListApi.getUserTokens()
    }

    emitChange() {
        this.emit("change")
    }

    checkAddress = address => {
        TokenListApi.searchToken(address, false)
            .then(token => {
                this.createToken = token
                this.tokenCheckError = ""
                this.checkingAddress = false
                this.emitChange()
            })
            .catch(e => {
                this.createToken.address = address
                this.createToken.lName = ""
                this.createToken.name = ""
                this.createToken.decimals = ""
                this.tokenCheckError = "Invalid address on " + WalletStore.getProvidedWeb3Info().netDescription
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
            case ActionNames.ADD_USER_TOKEN: {
                TokenListApi.addUserToken(action.token)
                this.emitChange()
                break
            }
            case ActionNames.REMOVE_USER_TOKEN: {
                TokenListApi.removeUserToken(action.token)
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