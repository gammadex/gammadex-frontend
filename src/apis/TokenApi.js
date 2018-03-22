import * as TokenActions from "../actions/TokenActions"
import * as WebSocketActions from "../actions/WebSocketActions"
import Config from "../Config"

function getUrlTokenFromProps(props) {
    return (props && props.match && props.match.params && props.match.params[0]) ? props.match.params[0] : null
}

export function ensureCorrectToken(prevProps, currProps, currentStateToken, invalidTokenIdentifier) {
    const prevUrlToken = getUrlTokenFromProps(prevProps)
    const currUrlToken = getUrlTokenFromProps(currProps)

    if (currUrlToken) {
        const token = Config.getTokenBySymbolOrAddress(currUrlToken)

        if (token) {
            const currentStateTokenName = currentStateToken ? currentStateToken.name : null

            if (token.name !== currentStateTokenName) {
                TokenActions.selectToken(token.name, token.address)
                WebSocketActions.getMarket()
            }

            if (invalidTokenIdentifier) {
                TokenActions.invalidToken(null)
            }
        } else if (currUrlToken !== prevUrlToken) {
            if (currUrlToken !== invalidTokenIdentifier) {
                TokenActions.invalidToken(currUrlToken)
            }
        }
    }
}