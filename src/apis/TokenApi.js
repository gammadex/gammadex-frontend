import * as TokenActions from "../actions/TokenActions"
import * as WebSocketActions from "../actions/WebSocketActions"
import TokenListApi from "../apis/TokenListApi"

function getUrlTokenFromProps(props) {
    return (props && props.match && props.match.params && props.match.params[0]) ? props.match.params[0] : null
}

function processToken(token, currentStateToken) {
    const currentStateTokenName = currentStateToken ? currentStateToken.name : null

    TokenActions.selectToken(token)
    if (token.name !== currentStateTokenName) {
        console.log("WOOT")
        WebSocketActions.getMarket()
    }
}

export function ensureCorrectToken(prevProps, currProps, currentStateToken) {
    const prevUrlToken = getUrlTokenFromProps(prevProps)
    const currUrlToken = getUrlTokenFromProps(currProps)

    if (currUrlToken && currUrlToken != prevUrlToken) {
        const foundToken = TokenListApi.getTokenBySymbolOrAddress(currUrlToken);
        if (foundToken) {
            processToken(foundToken, currentStateToken)
        } else if (TokenListApi.isAddress(currUrlToken)) {
            TokenActions.tokenLookup(currUrlToken, true)
        } else {
            TokenActions.invalidToken(currUrlToken)
        }
    }
}