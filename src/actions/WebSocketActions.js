import dispatcher from "../dispatcher"
import EtherDeltaWebSocket from "../EtherDeltaSocket"
import TokenStore from '../stores/TokenStore'
import AccountStore from '../stores/AccountStore'
import ActionNames from "./ActionNames"
import Config from "../Config"
import OrderFillNotifier from "../OrderFillNotifier"
import * as WebSocketActions from "./TokenActions"
import {getTokenFromUrl} from "../stores/UrlUtil"
import * as TokenBalancesActions from "./TokenBalancesActions"

export function connect() {
    const url = Config.getSocket()

    EtherDeltaWebSocket.init(
        url,
        {
            /*
             Quite a few more events supported:

             https://github.com/socketio/socket.io-client/blob/HEAD/docs/API.md

             'connect_timeout', 'reconnecting' and more... might be good for when showing websocket status
             */

            connect: (event) => {
                dispatcher.dispatch({
                    type: ActionNames.WEB_SOCKET_OPENED,
                    url,
                    event,
                })

                initialiseTokensAndGetMarket()
            },
            disconnect: (reason) => {
                dispatcher.dispatch({
                    type: ActionNames.WEB_SOCKET_CLOSED,
                    reason,
                })
            },
            error: (event) => {
                dispatcher.dispatch({
                    type: ActionNames.WEB_SOCKET_ERROR,
                    event,
                })

            },
            connect_error: (error) => {
                dispatcher.dispatch({
                    type: ActionNames.WEB_SOCKET_CONNECT_ERROR,
                    error,
                })
            },
        }, {
            market: (message) => {
                dispatcher.dispatch({
                    type: ActionNames.MESSAGE_RECEIVED_MARKET,
                    message,
                })
            },
            orders: (message) => {
                dispatcher.dispatch({
                    type: ActionNames.MESSAGE_RECEIVED_ORDERS,
                    message,
                })
            },
            myOrders: (message) => {
                dispatcher.dispatch({
                    type: ActionNames.MESSAGE_RECEIVED_MY_ORDERS,
                    message,
                })
            },
            trades: (trades) => {
                dispatcher.dispatch({
                    type: ActionNames.MESSAGE_RECEIVED_TRADES,
                    trades,
                })
                OrderFillNotifier.notifyMaker(trades, AccountStore.getAccountState().account)
            },
            funds: (funds) => {
                dispatcher.dispatch({
                    type: ActionNames.MESSAGE_RECEIVED_FUNDS,
                    funds,
                })
            },
            tokens: (message) => {
                dispatcher.dispatch({
                    type: ActionNames.MESSAGE_RECEIVED_TOKENS,
                    message,
                })

                selectUrlToken()
                getMarket()
            },
            tokenBalances: (message) => {
                if (message.status === 'error') {
                    TokenBalancesActions.tokenBalancesFailed()
                } else {
                    console.log("tokenBalances message", JSON.stringify(message))
                    TokenBalancesActions.tokenBalancesRetrieved(message)
                }
            }
        }
    )

    dispatcher.dispatch({
        type: ActionNames.WEB_SOCKET_CONSTRUCTED,
        url
    })
}

function selectUrlToken() {
    const token = TokenStore.getTokenByAddressOrSymbol(getTokenFromUrl())
    if (token) {
        WebSocketActions.selectToken(token)
    }
}

function initialiseTokensAndGetMarket() {
    const tokenKnownToBrowser = !!TokenStore.getTokenByAddressOrSymbol(getTokenFromUrl())
    if (tokenKnownToBrowser) {
        getMarket()
    } else {
        EtherDeltaWebSocket.getTokens()
    }
}

export function getMarket(notifyRequested = true) {
    const tokenAddress = TokenStore.getSelectedTokenAddress()
    const account = AccountStore.getAccount()

    if (tokenAddress || account) {
        if (notifyRequested) {
            dispatcher.dispatch({
                type: ActionNames.MESSAGE_REQUESTED_MARKET,
            })
        }
        EtherDeltaWebSocket.getMarket(tokenAddress, account, TokenStore.getListedTokensVersion())
    }
}

export function getTokenBalances(account) {
    if (account) {
        EtherDeltaWebSocket.getTokenBalances(account)
        TokenBalancesActions.sentGetTokenBalances()
    }
}