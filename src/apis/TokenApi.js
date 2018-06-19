import * as TokenActions from "../actions/TokenActions"
import * as WebSocketActions from "../actions/WebSocketActions"
import TokenRepository from "../util/TokenRepository"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import * as TokenUtil from "../util/TokenUtil"

export function ensureCorrectToken(prevProps, currProps, currentStateToken) {
    function getUrlTokenFromProps(props) {
        return (props && props.match && props.match.params && props.match.params[0]) ? props.match.params[0] : null
    }

    const prevUrlToken = getUrlTokenFromProps(prevProps)
    let currUrlToken = getUrlTokenFromProps(currProps)

    if (!currUrlToken) {
        currProps.history.push(`/exchange/${TokenRepository.getDefaultToken().symbol}`)
        currUrlToken = TokenRepository.getDefaultToken().symbol
    }

    if (currUrlToken && currUrlToken != prevUrlToken) {
        const listedToken = TokenRepository.getTokenBySymbolOrAddress(currUrlToken, true)
        const foundToken = listedToken || TokenRepository.getTokenByAddress(currUrlToken)

        if (foundToken) {
            processToken(foundToken, currentStateToken)
        } else {
            if (TokenUtil.isAddress(currUrlToken)) {
                unrecognisedTokenLookup(currUrlToken)
            } else {
                TokenActions.invalidTokenIdentifierInUrl(currUrlToken)
            }
        }
    }
}

function processToken(token, currentStateToken) {
    const currentStateTokenName = currentStateToken ? currentStateToken.symbol : null

    TokenActions.selectToken(token)
    if (token.symbol !== currentStateTokenName) {
        WebSocketActions.getMarket()
    }
}

export function unrecognisedTokenLookup(address) {
    TokenActions.unrecognisedTokenAddressLookup(address)

    EtherDeltaWeb3.promiseGetTokenDetails(address)
        .then(token => Object.assign({}, token, {isListed: false, isUnrecognised: true}))
        .then(token => {
            TokenActions.unrecognisedTokenLookupComplete(address, token)
            TokenActions.selectToken(token)
            WebSocketActions.getMarket()
        })
        .catch(e => {
            TokenActions.unrecognisedTokenCheckError(address, e)
        })
}

export function unlistedTokenLookup(address) {
    TokenActions.unlistedTokenAddressLookup(address)

    EtherDeltaWeb3.promiseGetTokenDetails(address)
        .then(token => Object.assign({}, token, {isListed: false}))
        .then(token => {
            const error = TokenRepository.tokenExists(token.address) ? `Token ${token.symbol} already registered` : null
            TokenActions.unlistedTokenLookupComplete(address, token, error)
        })
        .catch(e => {
            TokenActions.unlistedTokenCheckError(address, "Token not found")
        })
}
