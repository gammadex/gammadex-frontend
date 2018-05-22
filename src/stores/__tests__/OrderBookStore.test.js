import OrderBookStore from "../OrderBookStore"
import ActionNames from "../../actions/ActionNames"

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
