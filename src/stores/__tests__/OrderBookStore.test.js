import OrderBookStore from "../OrderBookStore"
import ActionNames from "../../actions/ActionNames"

test("two latest bids is null when no bids", () => {
    const buys = []
    const action = createActionFromBids(buys)

    OrderBookStore.handleActions(action)
    const latestBids = OrderBookStore.getTwoLatestBidPrices()

    expect(latestBids).toBeNull()
})

test("two latest offers is null when no offers", () => {
    const sells = []
    const action = createActionFromOffers(sells)
    OrderBookStore.handleActions(action)

    const latestOffers = OrderBookStore.getTwoLatestOfferPrices()

    expect(latestOffers).toBeNull()
})

test("two latest trades is null when no trades", () => {
    const trades = []
    const action = createActionFromTrades(trades)
    OrderBookStore.handleActions(action)

    const latestTrades = OrderBookStore.getTwoLatestTradePrices()

    expect(latestTrades).toBeNull()
})

test("two latest bids are latest two prices by date", () => {
    const order1 = makeOrder("id_1", 0.1, "2018-01-01T12:00:00.000Z")
    const order2 = makeOrder("id_2", 0.2, "2018-01-01T13:00:00.000Z")
    const order3 = makeOrder("id_3", 0.5, "2018-01-01T14:00:00.000Z")
    const buys = [order1, order2, order3]
    const action = createActionFromBids(buys)
    OrderBookStore.handleActions(action)

    const latestBids = OrderBookStore.getTwoLatestBidPrices()

    expect(latestBids).toEqual([0.2, 0.5])
})

test("bids on current page are ordered by value descending", () => {
    const order1 = makeOrder("id_1", 0.1, "2018-01-01T12:00:00.000Z")
    const order2 = makeOrder("id_2", 0.2, "2018-01-01T13:00:00.000Z")
    const order3 = makeOrder("id_3", 0.5, "2018-01-01T14:00:00.000Z")
    const buys = [order1, order2, order3]
    const action = createActionFromBids(buys)
    OrderBookStore.handleActions(action)

    const bids = OrderBookStore.getBidsOnCurrentPage()

    const expected = [order3, order2, order1]

    expect(bids).toEqual(expected)
})

test("two latest offers are latest two prices by date", () => {
    const order1 = makeOrder("id_1", 0.2, "2018-01-01T12:00:00.000Z")
    const order2 = makeOrder("id_2", 0.4, "2018-01-01T13:00:00.000Z")
    const order3 = makeOrder("id_3", 0.1, "2018-01-01T14:00:00.000Z")
    const sells = [order1, order2, order3]
    const action = createActionFromOffers(sells)
    OrderBookStore.handleActions(action)

    const latestOffers = OrderBookStore.getTwoLatestOfferPrices()

    expect(latestOffers).toEqual([0.4, 0.1])
})

test("offers on current page are ordered by value ascending", () => {
    const order1 = makeOrder("id_1", 0.2, "2018-01-01T12:00:00.000Z")
    const order2 = makeOrder("id_2", 0.4, "2018-01-01T13:00:00.000Z")
    const order3 = makeOrder("id_3", 0.1, "2018-01-01T14:00:00.000Z")
    const sells = [order3, order1, order2]
    const action = createActionFromOffers(sells)
    OrderBookStore.handleActions(action)

    const offers = OrderBookStore.getOffersOnCurrentPage()

    const expected = [order3, order1, order2]

    expect(offers).toEqual(expected)
})

test("two latest trades are latest two prices by date", () => {
    const trade1 = makeTrade("0x1", 0.2, "2018-01-01T12:00:00.000Z")
    const trade2 = makeTrade("0x2", 0.4, "2018-01-01T13:00:00.000Z")
    const trade3 = makeTrade("0x3", 0.1, "2018-01-01T14:00:00.000Z")
    const trades = [trade1, trade2, trade3]
    const action = createActionFromTrades(trades)
    OrderBookStore.handleActions(action)

    const latestOffers = OrderBookStore.getTwoLatestTradePrices()

    expect(latestOffers).toEqual([0.4, 0.1])
})

test("trades on current page are ordered by date descending", () => {
    const trade1 = makeTrade("0x1", 0.2, "2018-01-01T12:00:00.000Z")
    const trade2 = makeTrade("0x2", 0.4, "2018-01-01T13:00:00.000Z")
    const trade3 = makeTrade("0x3", 0.1, "2018-01-01T14:00:00.000Z")
    const trades = [trade3, trade1, trade2]
    const action = createActionFromTrades(trades)
    OrderBookStore.handleActions(action)

    const result = OrderBookStore.getTradesOnCurrentPage()

    const expected = [trade3, trade2, trade1]

    expect(result).toEqual(expected)
})

test("all trades is sorted by date ascending ascending", () => {
    const trade1 = makeTrade("0x1", 0.2, "2018-01-01T12:00:00.000Z")
    const trade2 = makeTrade("0x2", 0.4, "2018-01-01T13:00:00.000Z")
    const trade3 = makeTrade("0x3", 0.1, "2018-01-01T14:00:00.000Z")
    const trades = [trade3, trade1, trade2]
    const action = createActionFromTrades(trades)
    OrderBookStore.handleActions(action)

    const result = OrderBookStore.getAllTradesSortedByDateAsc()

    const expected = [trade1, trade2, trade3]

    expect(result).toEqual(expected)
})


function makeOrder(id, price, updated) {
    return {
        id,
        price,
        updated
    }
}

function makeTrade(txHash, price, date) {
    return {
        txHash,
        price,
        date
    }
}

function createAction(buys, sells, trades) {
    return {
        type: ActionNames.MESSAGE_RECEIVED_MARKET,
        message: {
            trades: trades,
            orders: {
                sells: sells,
                buys: buys,
            }
        }
    }
}

const createActionFromOffers = (sells) => createAction([], sells, [])

const createActionFromBids = (buys) => createAction(buys, [], [])

const createActionFromTrades = (trades) => createAction([], [], trades)
