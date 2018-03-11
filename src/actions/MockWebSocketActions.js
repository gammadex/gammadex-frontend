import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import MockSocket from "../MockSocket"

export function connect() {
    const url = 'mock socket (TST orders)'

    dispatcher.dispatch({
        type: ActionNames.WEB_SOCKET_CONSTRUCTED,
        url
    });
    dispatcher.dispatch({
        type: ActionNames.WEB_SOCKET_OPENED
    })

    MockSocket.init({
        market: (message) => {
            dispatcher.dispatch({
                type: ActionNames.MESSAGE_RECEIVED_MARKET, message
            })
        },
        orders: (message) => {
            dispatcher.dispatch({
                type: ActionNames.MESSAGE_RECEIVED_ORDERS, message
            })
        }
    })
}
