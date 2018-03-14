import OrderFactory from "./OrderFactory"
import Config from "./Config"
import OrderSide from "./OrderSide"

// - The Order (parameter) contains bare essential economics, required to trade using the smart contract.

// - OrderDetail encapsulates the Order with additional static data (e.g. price, side) and fields to track filled progress.
//   The intent is to persist this to local storage and update it's state / filled progress using the smart contract.

// - The Socket Order replicates the format sent by the ED web socket, to render the mocked-up order book.

export function orderDetailFromOrder(order) {
    const orderHash = OrderFactory.orderHash(order.tokenGet, order.amountGet, order.tokenGive, order.amountGive, order.expires, order.nonce)

    const ethDivisor = Math.pow(10, Config.getBaseDecimals())
    const tokenDecimals = (order.tokenGive === Config.getBaseAddress()
        ? Config.getTokenDecimalsByAddress(order.tokenGet) : Config.getTokenDecimalsByAddress(order.tokenGive))
    const tokDivisor = Math.pow(10, tokenDecimals)

    const updated = (new Date()).toISOString()

    let price = 0
    let contractAvailableVolume = order.amountGet  // this is in order.amountGet terms: TOK units for 
    // maker buy and ETH units for maker sell

    if (isMakerBuy(order)) {
        price = (order.amountGive / ethDivisor) / (order.amountGet / tokDivisor)
    } else {
        price = (order.amountGet / ethDivisor) / (order.amountGive / tokDivisor)
    }

    return {
        order: order,
        orderHash: orderHash,
        makerSide: makerSide(order),
        price: price,
        tokenDecimals: tokenDecimals,
        contractAvailableVolume: contractAvailableVolume,
        contractFilledVolume: 0, // this is another on-chain bit of data, though not sure if we need it.
        updated: updated,
        // true, if: 1) fully filled, 2) cancelled = Cancel event on smart contract and force fully filled 3) expired
        // else false
        deleted: false
    }
}

export function orderDetailToSocketOrder(orderDetail) {
    const ethDivisor = Math.pow(10, Config.getBaseDecimals())
    const tokDivisor = Math.pow(10, orderDetail.tokenDecimals)

    // need to format orderbook (market response) as per ED websocket getMarket api
    // see https://github.com/forkdelta/backend-replacement/blob/4ff7bbc8575c2a38ff5a1bdc4efd4fe7856a00ab/app/services/websocket_server.py#L196

    let availableVolume = 0 // TOK amount in full decimals = wei
    let ethAvailableVolume = 0 // TOK amount normalized to TOK decimals

    let availableVolumeBase = 0 // ETH amount in full decimals = wei
    let ethAvailableVolumeBase = 0 // ETH amount normalized to ETH decimals (18) = eth
    let amount = 0
    if (orderDetail.makerSide === OrderSide.BUY) {
        availableVolume = orderDetail.contractAvailableVolume
        ethAvailableVolume = (availableVolume / tokDivisor)

        availableVolumeBase = availableVolume * orderDetail.price
        ethAvailableVolumeBase = (availableVolumeBase / ethDivisor)

        amount = -availableVolume
    } else {
        availableVolumeBase = orderDetail.contractAvailableVolume
        ethAvailableVolumeBase = (availableVolumeBase / ethDivisor)

        availableVolume = availableVolumeBase / orderDetail.price
        ethAvailableVolume = (availableVolume / tokDivisor)

        amount = availableVolume
    }
    
    return {
        id: `${orderDetail.orderHash}_${orderDetail.makerSide}`,
        user: orderDetail.order.user,
        tokenGet: orderDetail.order.tokenGet,
        amountGet: orderDetail.order.amountGet.toString(),
        tokenGive: orderDetail.order.tokenGive,
        amountGive: orderDetail.order.amountGive.toString(),
        expires: orderDetail.order.expires.toString(),
        nonce: orderDetail.order.nonce.toString(),
        v: orderDetail.order.v,
        r: orderDetail.order.r,
        s: orderDetail.order.s,
        price: orderDetail.price.toString(),
        updated: orderDetail.updated,
        availableVolume: availableVolume.toString(),
        availableVolumeBase: availableVolumeBase.toString(),
        ethAvailableVolume: ethAvailableVolume.toString(),
        ethAvailableVolumeBase: ethAvailableVolumeBase.toString(),
        amount: amount.toString(),
        amountFilled: (0).toString(), // TODO
        deleted: orderDetail.deleted // this is an ED field
        // state: State.OPEN - this is a ForkDelta-only bit of metadata
    }
}

export function makerSide(order) {
    if(order.tokenGive === Config.getBaseAddress()) {
        return OrderSide.BUY
    } else {
        return OrderSide.SELL
    }
}

export function takerSide(order) {
    if(makerSide(order) === OrderSide.BUY) {
        return OrderSide.SELL
    } else {
        return OrderSide.BUY
    }
}

export function tokenAddress(order) {
    if(order.tokenGive === Config.getBaseAddress()) {
        return order.tokenGet
    } else {
        return order.tokenGive
    }
}

export function isMakerBuy(order) {
    return (makerSide(order) === OrderSide.BUY)
}

export function isMakerSell(order) {
    return (makerSide(order) === OrderSide.SELL)
}

export function isTakerBuy(order) {
    return (takerSide(order) === OrderSide.BUY)
}

export function isTakerSell(order) {
    return (takerSide(order) === OrderSide.SELL)
}