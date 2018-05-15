import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import _ from "lodash"
import TokenListApi from "../apis/TokenListApi"
import WalletStore from "./WalletStore"

class TokenStore extends EventEmitter {
    constructor() {
        super()
        this.selectedToken = TokenListApi.getDefaultToken()
        this.searchToken = ""
        this.serverTickers = {}
        this.tokenWarning = null
        this.createToken = {
            address: "",
            lName: "",
            name: "",
            decimals: "",
            unlisted: true
        }

        this.tokenCheckError = ""
        this.checkingAddress = false
    }

    getSelectedToken() {
        return this.selectedToken
    }

    getSelectedTokenAddress() {
        return this.selectedToken ? this.selectedToken.address : null
    }

    getSearchToken() {
        return this.searchToken
    }

    getServerTickers() {
        return this.serverTickers
    }

    getTokenWarning() {
        return this.tokenWarning
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

    setWarning(title, message) {
        this.tokenWarning = { title, message }
    }

    setInvalidToken() {
        this.tokenCheckError = `Invalid address on ${WalletStore.getProvidedWeb3Info().netDescription}`
    }

    reset(address) {
        this.createToken = {
            address: address,
            lName: "",
            name: "",
            decimals: "",
            unlisted: true
        }

        if (address === "" || TokenListApi.isAddress(address)) {
            this.tokenCheckError = ""
        } else {
            this.setInvalidToken()
        }
    }

    emitChange() {
        this.emit("change")
    }

    checkAddress = address => {
        TokenListApi.searchToken(address, false)
            .then(token => {
                this.createToken = token
                if (TokenListApi.find({address: this.createToken.address})) {
                    this.tokenCheckError = `Token ${this.createToken.name} already registered`
                } else {
                    this.tokenCheckError = ""
                }

                this.checkingAddress = false
                this.emitChange()
            })
            .catch(e => {
                this.reset(address)
                this.setInvalidToken()
                this.checkingAddress = false
                this.emitChange()
            })
        
        this.checkingAddress = true
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.SELECT_TOKEN: {
                this.selectedToken = action.token
                this.tokenWarning = null
                if (this.selectedToken.unlisted) {
                    this.setWarning("Unlisted Token", `Token ${this.selectedToken.name} is not listed on Gammadex -- proceed at your own risk`)
                }

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
                if (action.tokenIdentifier) {
                    this.setWarning("No Matching Token", `Token ${action.tokenIdentifier} is not recognised as an address or symbol`)
                } else {
                    this.tokenWarning = null
                }

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
                this.reset("")
                this.emitChange()
                break
            }
            case ActionNames.REMOVE_USER_TOKEN: {
                TokenListApi.removeUserToken(action.token)
                this.emitChange()
                break
            }
            case ActionNames.RESET_CREATE_TOKEN: {
                this.reset(action.address)
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