import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import _ from "lodash"
import * as TokenUtil from "../util/TokenUtil"
import * as CachedTokensDao from "../util/CachedTokensDao"
import Config from "../Config"

class TokenStore extends EventEmitter {
    constructor() {
        super()
        this.loadTokensFromLocalStorage()
        this.selectedToken = Config.getEnv().defaultPair.token
        this.searchToken = ""
        this.serverTickers = {}
        this.createUnlistedToken = {
            address: "",
            name: "",
            symbol: "",
            decimals: "",
            isListed: false
        }

        this.unlistedTokenCheckError = ""
        this.checkingUnlistedAddress = false
        this.unrecognisedToken = null
        this.checkingUnrecognisedAddress = false
        this.unrecognisedTokenCheckError = null
    }

    getListedTokens() {
        return this.listedTokens
    }

    getListedTokensVersion() {
        return this.listedTokensVersion
    }

    getUserTokens() {
        return this.userTokens
    }

    getAllTokens() {
        return this.allTokens.slice()
    }

    getSelectedToken() {
        return this.selectedToken
    }

    getSelectedTokenSymbol() {
        return this.selectedToken ? this.selectedToken.symbol : null
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

    getCreateToken() {
        return this.createUnlistedToken
    }

    isCheckingUnlistedAddress() {
        return this.checkingUnlistedAddress
    }

    getUnlistedTokenCheckError() {
        return this.unlistedTokenCheckError
    }

    getUnrecognisedToken() {
        return this.unrecognisedToken
    }

    isCheckingUnrecognisedAddress() {
        return this.checkingUnrecognisedAddress
    }

    getUnrecognisedTokenCheckError() {
        return this.unrecognisedTokenCheckError
    }

    isListedOrUserToken(address) {
        return _.some(this.getListedTokens(), t => t.address.toLowerCase() === address.toLowerCase())
            || _.some(this.getUserTokens(), t => t.address.toLowerCase() === address.toLowerCase())
    }

    loadTokensFromLocalStorage() {
        const [listedTokens, listedTokensVersion] = CachedTokensDao.getCachedServerTokensAndVersion()
        if (listedTokensVersion > -1) {
            this.listedTokens = listedTokens
            this.listedTokensVersion = listedTokensVersion
        } else {
            this.listedTokens = [Config.getEnv().defaultPair.token]
            this.listedTokensVersion = 0
        }

        this.userTokens = CachedTokensDao.getUserTokens()

        this._updateAllTokens()
    }

    reset(address) {
        this.createUnlistedToken = {
            address: address,
            name: "",
            symbol: "",
            decimals: "",
            isListed: false
        }

        if (address === "" || TokenUtil.isAddress(address)) {
            this.unlistedTokenCheckError = ""
        } else {
            this.unlistedTokenCheckError = "Invalid address"
        }
    }

    emitChange() {
        this.emit("change")
    }


    handleActions(action) {
        switch (action.type) {
            case ActionNames.SELECT_TOKEN: {
                const {token} = action
                this.selectedToken = token
                this.emitChange()
                break
            }
            case ActionNames.SEARCH_TOKEN: {
                this.searchToken = action.search
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_MARKET: {
                if (action.message) {
                    if (action.message.returnTicker) {
                        this.storeServerTickers(action.message.returnTicker)
                    }
                    if (action.message.tokens) {
                        CachedTokensDao.saveServerTokensAndVersion(action.message.tokens)
                        const {list, version} = action.message.tokens
                        this.listedTokens = list
                        this.listedTokensVersion = version

                        this._updateAllTokens()
                    }
                    if (action.message.returnTicker || action.message.tokens) {
                        this.emitChange()
                    }
                }

                break
            }
            case ActionNames.UNLISTED_TOKEN_ADDRESS_LOOKUP: {
                this.reset(action.address)
                this.checkingUnlistedAddress = true
                this.emitChange()
                break
            }
            case ActionNames.ADD_USER_TOKEN: {
                this.userTokens.push(action.token)
                CachedTokensDao.saveUserTokens(this.userTokens)
                this._updateAllTokens()
                this.reset("")
                this.emitChange()
                break
            }
            case ActionNames.REMOVE_USER_TOKEN: {
                const {token} = action
                this.userTokens = _.filter(this.userTokens, ut => ut.address.toLowerCase() !== token.address.toLowerCase())
                CachedTokensDao.saveUserTokens(this.userTokens)
                this._updateAllTokens()
                this.emitChange()
                break
            }
            case ActionNames.RESET_CREATE_TOKEN: {
                this.reset(action.address)
                this.emitChange()
                break
            }
            case ActionNames.UNLISTED_TOKEN_LOOKUP_LOOKUP_COMPLETE: {
                const {token, error} = action
                this.createUnlistedToken = token
                this.checkingUnlistedAddress = false
                this.unlistedTokenCheckError = error
                this.emitChange()
                break
            }
            case ActionNames.UNLISTED_TOKEN_CHECK_ERROR: {
                const {address, error} = action
                this.reset(address)
                this.checkingUnlistedAddress = false
                this.unlistedTokenCheckError = error
                this.emitChange()
                break
            }
            case ActionNames.UNRECOGNISED_TOKEN: {
                this.unrecognisedTokenIdentifier = action.tokenIdentifier
                this.unrecognisedToken = action.token // may be null
                this.selectedToken = null
                this.emitChange()
                break
            }
            case ActionNames.UNRECOGNISED_TOKEN_ADDRESS_LOOKUP: {
                this.reset(action.address)
                this.unrecognisedToken = null
                this.checkingUnrecognisedAddress = true
                this.unrecognisedTokenCheckError = null
                this.emitChange()
                break
            }
            case ActionNames.UNRECOGNISED_TOKEN_LOOKUP_LOOKUP_COMPLETE: {
                const {token, error} = action
                this.unrecognisedToken = token
                this.checkingUnrecognisedAddress = false
                this.unrecognisedTokenCheckError = error

                this.emitChange()
                break
            }
            case ActionNames.UNRECOGNISED_TOKEN_CHECK_ERROR: {
                const {error} = action
                this.unrecognisedToken = null
                this.checkingUnrecognisedAddress = false
                this.unrecognisedTokenCheckError = error
                this.emitChange()
                break
            }
        }
    }

    storeServerTickers(returnTicker) {
        this.serverTickers = _.reduce(Object.values(returnTicker), (acc, curr) => {
            acc[curr.tokenAddr.toLowerCase()] = curr
            return acc
        }, {})
    }

    _updateAllTokens() {
        this.allTokens = [...this.listedTokens, ...this.userTokens]
        if (this.unrecognisedToken && ! _.some(this.allTokens , t => t.address.toLowerCase() === this.unrecognisedToken.address.toLowerCase())) {
            this.allTokens.push(this.unrecognisedToken)
        }
    }
}

const tokensStore = new TokenStore()
dispatcher.register(tokensStore.handleActions.bind(tokensStore))

export default tokensStore