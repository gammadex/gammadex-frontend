import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import OrderFactory from "../OrderFactory"
import Config from '../Config'
import EtherDeltaWeb3 from '../EtherDeltaWeb3'
import AccountStore from '../stores/AccountStore'

export function connect() {
    const url = 'mock socket (TST orders)'

    dispatcher.dispatch({
        type: ActionNames.WEB_SOCKET_CONSTRUCTED,
        url
    });
    dispatcher.dispatch({
        type: ActionNames.WEB_SOCKET_OPENED
    })

    getMockMarket()
}

// TODO this probably shouldn't live in the action
export function getMockMarket() {
    const makerAddress = "0xed230018BF455D72D8b6D416FE2e1b1D8d5D9376"
    const makerPrivateKey = "222941a07030ef2477b547da97259a33f4e3a6febeb081da8210cffc86dd138f"
    const tstDecimals = Config.getTokenDecimals('TST')
    const tstDivisor = Math.pow(10, tstDecimals)
    const ethDivisor = Math.pow(10, Config.getBaseDecimals())
    const buyOrder1 = OrderFactory.createOrder('buy', 10000000, 0.004, 0.08, Config.getTokenAddress('TST'), tstDecimals, makerAddress, makerPrivateKey)
    const buyOrder2 = OrderFactory.createOrder('buy', 10000000, 0.0041, 0.31, Config.getTokenAddress('TST'), tstDecimals, makerAddress, makerPrivateKey)
    const buyOrder3 = OrderFactory.createOrder('buy', 10000000, 0.0038, 20, Config.getTokenAddress('TST'), tstDecimals, makerAddress, makerPrivateKey)
    const sellOrder1 = OrderFactory.createOrder('sell', 10000000, 0.0064, 0.11, Config.getTokenAddress('TST'), tstDecimals, makerAddress, makerPrivateKey)
    const sellOrder2 = OrderFactory.createOrder('sell', 10000000, 0.0061, 0.75, Config.getTokenAddress('TST'), tstDecimals, makerAddress, makerPrivateKey)
    const sellOrder3 = OrderFactory.createOrder('sell', 10000000, 0.71, 100.4, Config.getTokenAddress('TST'), tstDecimals, makerAddress, makerPrivateKey)

    // fillOrder(makerAddress, sellOrder)

    const message = {
        orders: {
            buys: [toBookOrder(buyOrder1), toBookOrder(buyOrder2), toBookOrder(buyOrder3)],
            sells: [toBookOrder(sellOrder1), toBookOrder(sellOrder2), toBookOrder(sellOrder3)]
        }
    }
    console.log(message)
    dispatcher.dispatch({
        type: ActionNames.MESSAGE_RECEIVED_MARKET, message
    })

    function toBookOrder(order) {
        
        const orderHash = OrderFactory.orderHash(order.tokenGet, order.amountGet, order.tokenGive, order.amountGive, order.expires, order.nonce)
        // need to format orderbook (market response) as per ED websocket getMarket api
        // see https://github.com/forkdelta/backend-replacement/blob/4ff7bbc8575c2a38ff5a1bdc4efd4fe7856a00ab/app/services/websocket_server.py#L196

        const side = (order.tokenGive === Config.getBaseAddress()) ? 'buy' : 'sell'

        let price = 0
        let availableVolume = ''
        let availableVolumeBase = ''
        let ethAvailableVolume = ''
        let ethAvailableVolumeBase = ''
        let amount = ''
        if (side === 'buy') {
            price = (order.amountGive / ethDivisor) / (order.amountGet / tstDivisor)
            availableVolume = order.amountGet.toString()
            availableVolumeBase = order.amountGive.toString()
            ethAvailableVolume = (order.amountGet / tstDivisor).toString()
            ethAvailableVolumeBase = (order.amountGive / ethDivisor).toString()  
            amount = order.amountGet.toString()
        } else {
            price = (order.amountGet / tstDivisor) / (order.amountGive / ethDivisor)
            availableVolume = order.amountGive.toString()
            availableVolumeBase = order.amountGet.toString()
            ethAvailableVolume = (order.amountGive / tstDivisor).toString()
            ethAvailableVolumeBase = (order.amountGet / ethDivisor).toString()  
            amount = (-order.amountGive).toString()
        }

        console.log(`user ${order.user} wants to ${side} ${ethAvailableVolume} TST for ${ethAvailableVolumeBase} ETH, price is ${price}. Read as ${price} TSTs per ETH`)

        return {
            id: `${orderHash}_${side}`,
            user: order.user,
            tokenGet: order.tokenGet,
            amountGet: order.amountGet.toString(),
            tokenGive: order.tokenGive,
            amountGive: order.amountGive.toString(),
            expires: order.expires.toString(),
            nonce: order.nonce.toString(),
            v: order.v,
            r: order.r,
            s: order.s,
            price: price.toString(),
            updated: (new Date()).toISOString(),
            availableVolume: availableVolume,
            availableVolumeBase: availableVolumeBase,
            ethAvailableVolume: ethAvailableVolume,
            ethAvailableVolumeBase: ethAvailableVolumeBase,
            amount: amount,
            amountFilled: null
        }
    }

    // TestTrade then send. This is mainly to check whether the orders we create/sign are valid
    function fillOrder(takerAddress, order) {
        EtherDeltaWeb3.promiseTestTrade(takerAddress, order, order.amountGet)
            .then(isTradable => {
                if (isTradable) {
                    EtherDeltaWeb3.promiseTrade(takerAddress, AccountStore.getAccountState().nonce, order, order.amountGet)
                        .once('transactionHash', hash => {
                            console.log(`${Config.getEtherscanUrl()}/tx/${hash}`)
                        })
                        .on('error', error => { console.log(`failed to trade: ${error.message}`) })
                        .then(receipt => {

                        })
                }
            })
    }

}