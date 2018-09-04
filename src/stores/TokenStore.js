import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import _ from "lodash"
import * as CachedTokensDao from "../util/CachedTokensDao"
import Config from "../Config"
import {truncateAddress} from "../util/FormatUtil"

class TokenStore extends EventEmitter {
    constructor() {
        super()
        this.loadTokensFromLocalStorage()
        this.selectedToken = null
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
        this.checkingUnrecognisedAddress = null
        this.unrecognisedTokenCheckError = null
    }

    areTokensLoaded() {
        return (this.listedTokens || []).length > 2
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

    getCheckingUnrecognisedAddress() {
        return this.checkingUnrecognisedAddress
    }

    getUnrecognisedTokenCheckError() {
        return this.unrecognisedTokenCheckError
    }

    getInvalidTokenIdentifierInUrl() {
        return this.invalidTokenIdentifierInUrl
    }

    isListedOrUserToken(address) {
        return _.some(this.getListedTokens(), t => t.address.toLowerCase() === address.toLowerCase())
            || _.some(this.getUserTokens(), t => t.address.toLowerCase() === address.toLowerCase())
    }

    getTokenByAddress(address) {
        if (! address) {
            return null
        }

        if (address === Config.getBaseAddress()) {
            return Config.getEnv().defaultPair.base
        } else {
            return this.find(t => t.address.toLowerCase() === address.toLowerCase())
        }
    }

    getTokenByAddressOrSymbol(addressOrSymbol) {
        if (! addressOrSymbol) {
            return null
        }

        if (addressOrSymbol === Config.getBaseAddress()) {
            return Config.getEnv().defaultPair.base
        } else if(addressOrSymbol.startsWith("0x")) {
            return _.find(this.getAllTokens(), t => t.address.toLowerCase() === addressOrSymbol.toLowerCase())
        } else {
            return _.find(this.getListedTokens(), t => t.symbol.toLowerCase() === addressOrSymbol.toLowerCase())
        }
    }

    getTokenName(address) {
        if (! address) {
            return null
        }

        const token = this.getTokenByAddress(address)

        return token ? token.symbol : null
    }

    getTokenIdentifier(address) {
        const token = this.getTokenByAddress(address)

        return token ? token.symbol : truncateAddress(address)
    }

    tokenExists(address) {
        return this.getTokenName(address) !== null
    }

    find(predicate) {
        return _.find(this.getAllTokens(), predicate)
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

        this.unlistedTokenCheckError = null
    }

    emitChange() {
        this.emit("change")
    }


    handleActions(action) {
        switch (action.type) {
            case ActionNames.SELECT_TOKEN: {
                const {token} = action
                this.selectedToken = token
                this.invalidTokenIdentifierInUrl = null
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
            case ActionNames.MESSAGE_RECEIVED_TOKENS: {
                if (action.message) {
                    if (action.message.tokens) {
                        CachedTokensDao.saveServerTokensAndVersion(action.message.tokens)
                        const {list, version} = action.message.tokens
                        this.listedTokens = list
                        this.listedTokensVersion = version

                        this._updateAllTokens()
                    }

                    this.emitChange()
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
            case ActionNames.UNRECOGNISED_TOKEN_ADDRESS_LOOKUP: {
                const {address} = action
                this.unrecognisedToken = null
                this.checkingUnrecognisedAddress = address
                this.unrecognisedTokenCheckError = null
                this.invalidTokenIdentifierInUrl = null
                this.emitChange()
                break
            }
            case ActionNames.UNRECOGNISED_TOKEN_LOOKUP_LOOKUP_COMPLETE: {
                const {token, error} = action
                this.unrecognisedToken = token
                this.checkingUnrecognisedAddress = null
                this.unrecognisedTokenCheckError = error
                this._updateAllTokens()
                this.emitChange()
                break
            }
            case ActionNames.UNRECOGNISED_TOKEN_CHECK_ERROR: {
                const {error} = action
                this.unrecognisedToken = null
                this.checkingUnrecognisedAddress = null
                this.unrecognisedTokenCheckError = error
                this.emitChange()
                break
            }
            case ActionNames.INVALID_TOKEN_IDENTIFIER_IN_URL: {
                const {tokenIdentifier} = action
                this.selectedToken = null
                this.unrecognisedToken = null
                this.checkingUnrecognisedAddress = null
                this.invalidTokenIdentifierInUrl = tokenIdentifier
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
        if (this.unrecognisedToken && !_.some(this.allTokens, t => t.address.toLowerCase() === this.unrecognisedToken.address.toLowerCase())) {
            this.allTokens.push(this.unrecognisedToken)
        }
    }
}

const tokensStore = new TokenStore()
dispatcher.register(tokensStore.handleActions.bind(tokensStore))

export default tokensStore