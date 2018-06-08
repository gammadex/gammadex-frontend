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
        this.tokenWarning = null
        this.createToken = {
            address: "",
            name: "",
            symbol: "",
            decimals: "",
            isListed: false
        }

        this.tokenCheckError = ""
        this.checkingAddress = false
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
        return this.allTokens
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

    setWarning(title, message) {
        this.tokenWarning = {title, message}
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
        this.createToken = {
            address: address,
            name: "",
            symbol: "",
            decimals: "",
            isListed: false
        }

        if (address === "" || TokenUtil.isAddress(address)) {
            this.tokenCheckError = ""
        } else {
            this.tokenCheckError = "Invalid address"
        }
    }

    emitChange() {
        this.emit("change")
    }

    selectToken = token => {
        this.selectedToken = token
        this.tokenWarning = null
        if (!this.selectedToken.isListed) {
            this.setWarning("Unlisted Token", `Token ${this.selectedToken.symbol} is not listed on GammaDex -- proceed at your own risk`)
        }
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.SELECT_TOKEN: {
                this.selectToken(action.token)
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
                this.reset(action.address)
                this.checkingAddress = true
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
            case ActionNames.TOKEN_LOOKUP_LOOKUP_COMPLETE: {
                const {token, error} = action
                this.createToken = token
                this.checkingAddress = false
                this.tokenCheckError = error
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_CHECK_ERROR: {
                const {address, error} = action
                this.reset(address)
                this.checkingAddress = false
                this.tokenCheckError = error
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
        console.log(this.listedTokens, this.userTokens)

        this.allTokens = [...this.listedTokens, ...this.userTokens]
    }
}

const tokensStore = new TokenStore()
dispatcher.register(tokensStore.handleActions.bind(tokensStore))

export default tokensStore