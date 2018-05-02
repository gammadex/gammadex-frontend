import dispatcher from "../dispatcher"
import EtherDeltaWebSocket from "../EtherDeltaSocket"
import TokenStore from '../stores/TokenStore'
import AccountStore from '../stores/AccountStore'
import ActionNames from "./ActionNames"
import Config from "../Config"

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
            trades: (message) => {
                dispatcher.dispatch({
                    type: ActionNames.MESSAGE_RECEIVED_TRADES,
                    message,
                })
            },
            funds: (message) => {
                dispatcher.dispatch({
                    type: ActionNames.MESSAGE_RECEIVED_FUNDS,
                    message,
                })
            },
        }
    )

    dispatcher.dispatch({
        type: ActionNames.WEB_SOCKET_CONSTRUCTED,
        url
    })
}

export function getMarket() {
    EtherDeltaWebSocket.getMarket(TokenStore.getSelectedToken().address, AccountStore.getAccountState().account)
}