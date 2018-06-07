import _ from "lodash"

export function getCachedServerTokensAndVersion() {
    if (localStorage.cachedTokens) {
        const cachedTokens = JSON.parse(localStorage.cachedTokens)
        const version = parseInt(cachedTokens.version)
        const tokens = cachedTokens.list

        if (_.isNumber(version) && _.isArray(tokens)) {
            return [tokens, version]
        }
    }

    return [[], -1]
}

export function saveServerTokensAndVersion(tokensAndVersion) {
    localStorage.cachedTokens = JSON.stringify(tokensAndVersion)
}

export function getUserTokens() {
    if (localStorage.userTokenList) {
        return JSON.parse(localStorage.userTokenList)
    }

    return []
}

export function saveUserTokens(userTokens) {
    localStorage.userTokenList = JSON.stringify(userTokens)
}