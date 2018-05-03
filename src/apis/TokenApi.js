import * as TokenActions from "../actions/TokenActions"
import * as WebSocketActions from "../actions/WebSocketActions"
import TokenListApi from "../apis/TokenListApi"

function getUrlTokenFromProps(props) {
    return (props && props.match && props.match.params && props.match.params[0]) ? props.match.params[0] : null
}

function processToken(token, currentStateToken, invalidTokenIdentifier) {
    const currentStateTokenName = currentStateToken ? currentStateToken.name : null

    if (token.name !== currentStateTokenName) {
        TokenActions.selectToken(token.name, token.address)
        WebSocketActions.getMarket()
    }

    if (invalidTokenIdentifier) {
        TokenActions.invalidToken(null)
    }
}

function badToken(prevUrlToken, currUrlToken, invalidTokenIdentifier) {
    if (currUrlToken !== prevUrlToken && currUrlToken !== invalidTokenIdentifier) {
        TokenActions.invalidToken(currUrlToken)
    }
}

export function ensureCorrectToken(prevProps, currProps, currentStateToken, invalidTokenIdentifier) {
    const prevUrlToken = getUrlTokenFromProps(prevProps)
    const currUrlToken = getUrlTokenFromProps(currProps)

    if (currUrlToken) {
        TokenListApi.getTokenBySymbolOrAddress(currUrlToken)
            .then(token => processToken(token, currentStateToken, invalidTokenIdentifier))
            .catch(bad => badToken(prevUrlToken, currUrlToken, invalidTokenIdentifier))
    }
}