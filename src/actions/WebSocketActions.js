import dispatcher from "../dispatcher"
import EtherDeltaWebSocket from "../EtherDeltaSocket"
import TokenStore from '../stores/TokenStore'
import AccountStore from '../stores/AccountStore'
import ActionNames from "./ActionNames"
import Config from "../Config"
import OrderFillNotifier from "../OrderFillNotifier"

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
                    event,
                })

                getMarket() // TODO - move me TF out of here
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
        }
    )

    dispatcher.dispatch({
        type: ActionNames.WEB_SOCKET_CONSTRUCTED,
        url
    })
}

export function getMarket(notifyRequested = true) {
    if (notifyRequested) {
        dispatcher.dispatch({
            type: ActionNames.MESSAGE_REQUESTED_MARKET,
        })
    }
    EtherDeltaWebSocket.getMarket(TokenStore.getSelectedToken().address, AccountStore.getAccountState().account, TokenStore.getListedTokensVersion())
}