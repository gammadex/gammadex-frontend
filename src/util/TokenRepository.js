import _ from "lodash"
import {addressesLooselyMatch, symbolsLooselyMatch} from './KeyUtil'
import TokenStore from "../stores/TokenStore"
import Config from "../Config"
import {truncateAddress} from "./FormatUtil"

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

    getTokenByAddress(address) {
        if (address === Config.getBaseAddress()) {
            return Config.getEnv().defaultPair.base
        } else {
            return this.find(t => t.address.toLowerCase() === address.toLowerCase())
        }
    }

    getTokenName(address) {
        const token = this.getTokenByAddress(address)

        return token ?  token.symbol : null
    }

    getTokenIdentifier(address) {
        const token = this.getTokenByAddress(address)

        return token ?  token.symbol : truncateAddress(address)
    }

    tokenExists(address) {
        return this.getTokenName(address) !== null
    }

    getTokenDecimalsByAddress(address) {
        const token = this.getTokenByAddress(address)

        if (token) {
            return token.decimals
        } else {
            throw new Error(`No decimals found for token ${address}`)
        }
    }

    getTokenBySymbolOrAddress(symbolOrAddress) {
        return this.find(tk => addressesLooselyMatch(tk.address, symbolOrAddress) || symbolsLooselyMatch(tk.symbol, symbolOrAddress))
    }
}

export default new TokenRepository()