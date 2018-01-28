import dispatcher from "../dispatcher";
import EtherDeltaWebSocket from "../EtherDeltaWebSocket"
import ActionNames from "./ActionNames"

export function connect() {
    const url = 'wss://socket01.etherdelta.com/socket.io/?transport=websocket'

    const etherDeltaWebSocket = new EtherDeltaWebSocket(url)

    etherDeltaWebSocket.init({
            onopen: (event) => {
                dispatcher.dispatch({
                    type: ActionNames.WEB_SOCKET_OPENED,
                    event,
                    url,
                    etherDeltaWebSocket
                });
            },
            onclose: (event) => {
                dispatcher.dispatch({
                    type: ActionNames.WEB_SOCKET_CLOSED,
                    event,
                });
            },
            onerror: (event) => {
                dispatcher.dispatch({
                    type: ActionNames.WEB_SOCKET_ERROR,
                    event,
                });
            },
        }, {
            market: (message) => {
                dispatcher.dispatch({
                    type: ActionNames.MESSAGE_RECEIVED_MARKET,
                    message,
                });
            },
            orders: (message) => {
                dispatcher.dispatch({
                    type: ActionNames.MESSAGE_RECEIVED_ORDERS,
                    message,
                });
            },
        }
    )
}

export function requestTicker(ticker) {
    dispatcher.dispatch({
        type: ActionNames.REQUEST_TICKER,
        ticker
    });
}