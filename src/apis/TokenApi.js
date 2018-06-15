import * as TokenActions from "../actions/TokenActions"
import * as WebSocketActions from "../actions/WebSocketActions"
import TokenRepository from "../util/TokenRepository"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"

function getUrlTokenFromProps(props) {
    return (props && props.match && props.match.params && props.match.params[0]) ? props.match.params[0] : null
}

function processToken(token, currentStateToken) {
    const currentStateTokenName = currentStateToken ? currentStateToken.symbol : null

    TokenActions.selectToken(token)
    if (token.symbol !== currentStateTokenName) {
        WebSocketActions.getMarket()
    }
}

export function ensureCorrectToken(prevProps, currProps, currentStateToken) {
    const prevUrlToken = getUrlTokenFromProps(prevProps)
    const currUrlToken = getUrlTokenFromProps(currProps)

    if (currUrlToken && currUrlToken != prevUrlToken) {
        const listedToken = TokenRepository.getTokenBySymbolOrAddress(currUrlToken, true)
        const foundToken = listedToken || TokenRepository.getTokenByAddress(currUrlToken)

        if (foundToken) {
            processToken(foundToken, currentStateToken)
        } else {
            TokenActions.invalidToken(currUrlToken)
        }
    }
}

export function tokenLookup(address) {
    TokenActions.tokenAddressLookup(address)

    EtherDeltaWeb3.promiseGetTokenDetails(address)
        .then(res => {
            const createToken = {
                address: address,
                name: res[0],
                symbol: res[1],
                decimals: res[2],
                isListed: false
            }

            return createToken
        })
        .then(token => {
            const error = TokenRepository.tokenExists(token.address) ? `Token ${token.symbol} already registered` : null
            TokenActions.tokenLookupComplete(address, token, error)
        })
        .catch(e => {
            console.log("ERR", e)
            TokenActions.tokenCheckError(address, "Invalid address")
        })
}