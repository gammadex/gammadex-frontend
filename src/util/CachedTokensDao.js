import _ from "lodash"
import Config from '../Config'

function key(name) {
    return Config.getReactEnv() + '.' + name
}

export function getCachedServerTokensAndVersion() {

    if (localStorage[key('cachedTokens')]) {
        const cachedTokens = JSON.parse(localStorage[key('cachedTokens')])
        const version = parseInt(cachedTokens.version)
        const tokens = cachedTokens.list

        if (_.isNumber(version) && _.isArray(tokens)) {
            return [tokens, version]
        }
    }

    return [[], -1]
}

export function saveServerTokensAndVersion(tokensAndVersion) {
    localStorage[key('cachedTokens')] = JSON.stringify(tokensAndVersion)
}

export function getUserTokens() {
    if (localStorage[key('userTokenList')]) {
        return JSON.parse(localStorage[key('userTokenList')])
    }

    return []
}

export function saveUserTokens(userTokens) {
    localStorage[key('userTokenList')] = JSON.stringify(userTokens)
}