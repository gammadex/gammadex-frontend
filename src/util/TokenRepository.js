import _ from "lodash"
import {addressesLooselyMatch, symbolsLooselyMatch} from './KeyUtil'
import TokenStore from "../stores/TokenStore"
import Config from "../Config"

class TokenRepository {
    getDefaultToken() {
        return Config.getEnv().defaultPair.token
    }

    getSystemTokens() {
        return TokenStore.getListedTokens()
    }

    getUserTokens() {
        return TokenStore.getUserTokens()
    }

    find(criteria) {
        return _.find(TokenStore.getAllTokens(), criteria)
    }

    getTokenName(address) {
        if (address === Config.getBaseAddress()) {
            return 'ETH'
        } else {
            const token = this.find(t => t.address.toLowerCase() === address.toLowerCase())
            return (token) ? token.symbol : null
        }
    }

    tokenExists(address) {
        return this.getTokenName(address) !== null
    }

    getTokenDecimalsByAddress(address) {
        if (address === Config.getBaseAddress()) {
            return 18
        } else {
            return this.find(t => t.address.toLowerCase() === address.toLowerCase()).decimals
        }
    }

    getTokenBySymbolOrAddress(symbolOrAddress) {
        return this.find(tk => addressesLooselyMatch(tk.address, symbolOrAddress) || symbolsLooselyMatch(tk.symbol, symbolOrAddress))
    }
}

export default new TokenRepository()