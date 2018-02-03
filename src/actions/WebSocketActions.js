import dispatcher from "../dispatcher"
import EtherDeltaWebSocket from "../EtherDeltaWebSocket"
import TokenStore from '../stores/TokenStore'
import ActionNames from "./ActionNames"

export function connect() {
    const url = 'wss://socket02.etherdelta.com/socket.io/?transport=websocket'

    EtherDeltaWebSocket.init(
        url,
        {
            onopen: (event) => {
                dispatcher.dispatch({
                    type: ActionNames.WEB_SOCKET_OPENED,
                    event,
                })

                getMarket()
            },
            onclose: (event) => {
                dispatcher.dispatch({
                    type: ActionNames.WEB_SOCKET_CLOSED,
                    event,
                })
            },
            onerror: (event) => {
                dispatcher.dispatch({
                    type: ActionNames.WEB_SOCKET_ERROR,
                    event,
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
    });
}

export function getMarket() {
    EtherDeltaWebSocket.getMarket(TokenStore.getSelectedToken().address)
}