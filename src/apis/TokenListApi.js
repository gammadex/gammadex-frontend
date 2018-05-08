import Config from "../Config"
import _ from "lodash"
import {addressesLooselyMatch, symbolsLooselyMatch} from '../util/KeyUtil'
import EtherDeltaWeb3 from "../EtherDeltaWeb3"

function isAddress(addressMaybe) {
    return addressMaybe.startsWith("0x")
}

function archive(userTokens) {
    localStorage.userTokenList = JSON.stringify(userTokens)
}

/**
 * Reads user tokens excluding those that are also in system tokens
 */
function readUserTokens(systemTokens, userTokens) {
    if (!userTokens) {
        return []
    }

    const systemSet = new Set(_.map(systemTokens, tk => tk.address))
    return _.filter(JSON.parse(userTokens), tk => !systemSet.has(tk.address))
}

class TokenListApi {
    constructor() {
        this.tokens = Config.getEnvTokens()
        this.systemTokens = _(this.tokens).filter(tk => tk.name !== "ETH").sortBy(tk => tk.name).value()
        this.userTokens = readUserTokens(this.systemTokens, localStorage.userTokenList)
    }

    getSystemTokens() {
        return this.systemTokens
    }

    getUserTokens() {
        return this.userTokens
    }

    addUserToken(token) {
        this.userTokens.push(token)
        archive(this.userTokens)
    }

    removeUserToken(token) {
        this.userTokens = _.filter(this.userTokens, ut => ut.address !== token.address)
        archive(this.userTokens)
    }

    find(criteria) {
        return _.find(_.concat(this.tokens, this.userTokens), criteria)
    }

    getTokenName(address) {
        const token = this.find({address})
        return (token) ? token.name : null
    }

    getTokenAddress(name) {
        return this.find({name}).address
    }

    getTokenDecimals(name) {
        return this.find({name}).decimals
    }

    getTokenDecimalsByAddress(address) {
        const t = this.find({address})
        return t ? t.decimals : 18
    }

    searchToken(address, addIfFound) {
        return EtherDeltaWeb3.promiseGetTokenDetails(address)
            .then(res => {
                const createToken = {
                    address: address,
                    lName: res[0],
                    name: res[1],
                    decimals: res[2]
                }

                if (addIfFound) {
                    this.addUserToken(createToken)
                }

                return createToken
            })
    }

    getTokenBySymbolOrAddress(symbolOrAddress) {
        const found = this.find(tk => addressesLooselyMatch(tk.address, symbolOrAddress) || symbolsLooselyMatch(tk.name, symbolOrAddress))
        if (found) {
            return Promise.resolve(found)
        } else if (isAddress(symbolOrAddress)) {
            return this.searchToken(symbolOrAddress, true);
        }

        return Promise.reject(symbolOrAddress)
    }

    getDefaultToken() {
        const name = Config.getEnv().defaultPair.token
        const address = this.getTokenAddress(name)

        return {
            name,
            address
        }
    }
}

export default new TokenListApi()