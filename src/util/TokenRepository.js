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

    find(predicate) {
        return TokenStore.find(predicate)
    }

    getTokenByAddress(address) {
        return TokenStore.getTokenByAddress(address)
    }

    getTokenName(address) {
        return TokenStore.getTokenName(address)
    }

    getTokenIdentifier(address) {
        return TokenStore.getTokenIdentifier(address)
    }

    tokenExists(address) {
        return TokenStore.tokenExists(address)
    }

    isListedOrUserToken(address) {
        if (! address) {
            return null
        }

        return _.some(this.getSystemTokens(), t => t.address.toLowerCase() === address.toLowerCase())
            || _.some(this.getUserTokens(), t => t.address.toLowerCase() === address.toLowerCase())
    }

    isListedToken(address) {
        if (! address) {
            return null
        }

        return _.some(this.getSystemTokens(), t => t.address.toLowerCase() === address.toLowerCase())
    }

    isUserToken(address) {
        return _.some(this.getUserTokens(), t => t.address.toLowerCase() === address.toLowerCase())
    }

    getTokenDecimalsByAddress(address) {
        const token = this.getTokenByAddress(address)

        if (token) {
            return token.decimals
        } else {
            throw new Error(`No decimals found for token ${address}`)
        }
    }

    getTokenBySymbolOrAddress(symbolOrAddress, listedOnly = false) {
        return this.find(tk => {
            const addressMatch = addressesLooselyMatch(tk.address, symbolOrAddress)
            const symbolMatch = symbolsLooselyMatch(tk.symbol, symbolOrAddress)
            const listingTypeMatch = tk.isListed || !listedOnly

            return (addressMatch || symbolMatch) && listingTypeMatch
        })
    }
}

export default new TokenRepository()