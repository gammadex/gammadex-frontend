import * as TokenActions from "../actions/TokenActions"
import * as WebSocketActions from "../actions/WebSocketActions"
import Config from "../Config"

export function selectTokenInUrlIfNotCurrentToken(urlTokenSymbolOrAddress, currentStateToken) {
    if (!urlTokenSymbolOrAddress || !currentStateToken) {
        return
    }

    const urlToken = Config.getTokenBySymbolOrAddress(urlTokenSymbolOrAddress)

    if (urlToken && urlToken.name && currentStateToken.name !== urlToken.name) {
        TokenActions.selectToken(urlToken.name, urlToken.address)
        WebSocketActions.getMarket()
    }
}
