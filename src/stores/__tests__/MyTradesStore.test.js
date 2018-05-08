import MyTradesStore from "../MyTradesStore"
import ActionNames from "../../actions/ActionNames"
import trades from "./trades.json"
import TransactionStatus from "../../TransactionStatus"
import * as TradesDao from "../../util/TradesDao"

beforeEach(() => {
    global.localStorage = {}
    MyTradesStore.clearTrades()
})

test("trades from trades message go into the completed pool", () => {
    MyTradesStore.handleActions({
        type: ActionNames.MESSAGE_RECEIVED_TRADES,
        trades: [trades[0]],
    })

    const completeTrades = MyTradesStore.getAllTrades().filter(t => t.status === TransactionStatus.COMPLETE)
    expect(completeTrades.length).toEqual(1)
})

test("trades from trades message won't add duplicates", () => {
    MyTradesStore.handleActions({
        type: ActionNames.MESSAGE_RECEIVED_TRADES,
        trades: [trades[0]],
    })

    MyTradesStore.handleActions({
        type: ActionNames.MESSAGE_RECEIVED_TRADES,
        trades: [trades[0]],
    })

    const completeTrades = MyTradesStore.getAllTrades().filter(t => t.status === TransactionStatus.COMPLETE)
    expect(completeTrades.length).toEqual(1)
})

test("trades from trades message get removed from the pending pool", () => {
    MyTradesStore.handleActions({
        type: ActionNames.MESSAGE_RECEIVED_TRADES,
        trades: [trades[0]],
    })

    const completeTrades = MyTradesStore.getAllTrades().filter(t => t.status === TransactionStatus.COMPLETE)
    expect(completeTrades.length).toEqual(1)
})

test("pending trades go into the pending pool", () => {
    MyTradesStore.handleActions({
        type: ActionNames.ADD_PENDING_TRADE,
        trade: trades[0],
    })

    const pendingTrades = MyTradesStore.getAllTrades().filter(t => t.status === TransactionStatus.PENDING)
    expect(pendingTrades.length).toEqual(1)
})

test("pending trades go into local storage if logged in with account", () => {
    // indicate account login
    MyTradesStore.handleActions({
        type: ActionNames.ACCOUNT_RETRIEVED,
        addressNonce: {address: "an address"}
    })

    MyTradesStore.handleActions({
        type: ActionNames.ADD_PENDING_TRADE,
        trade: trades[0],
    })

    const pendingTrades = TradesDao.loadPendingTrades("an address")
    expect(pendingTrades.length).toEqual(1)
})

test("when a pending trade succeeds it gets removed from the pending pool into the completed pool", () => {
    // add pending trade
    MyTradesStore.handleActions({
        type: ActionNames.ADD_PENDING_TRADE,
        trade: trades[0],
    })

    // indicate trade succeeded
    MyTradesStore.handleActions({
        type: ActionNames.MY_TRADE_STATUS_UPDATE_COMPLETED,
        txHash: trades[0].txHash,
    })

    const pendingTrades = MyTradesStore.getAllTrades().filter(t => t.status === TransactionStatus.PENDING)
    expect(pendingTrades.length).toEqual(0)

    const completedTrades = MyTradesStore.getAllTrades().filter(t => t.status === TransactionStatus.COMPLETE)
    expect(completedTrades.length).toEqual(1)
})

test("when a pending trade succeeds other completed trades are still in the completed pool", () => {
    MyTradesStore.handleActions({
        type: ActionNames.MESSAGE_RECEIVED_TRADES,
        trades: [trades[0]],
    })


    // add pending trade
    MyTradesStore.handleActions({
        type: ActionNames.ADD_PENDING_TRADE,
        trade: trades[1],
    })

    // indicate trade succeeded
    MyTradesStore.handleActions({
        type: ActionNames.MY_TRADE_STATUS_UPDATE_COMPLETED,
        txHash: trades[1].txHash,
    })

    const completedTrades = MyTradesStore.getAllTrades().filter(t => t.status === TransactionStatus.COMPLETE)
    expect(completedTrades.length).toEqual(2)
})

test("when a pending trade fails it gets removed from the pending pool and gets added to the failed pool", () => {
    // add pending trade
    MyTradesStore.handleActions({
        type: ActionNames.ADD_PENDING_TRADE,
        trade: trades[0],
    })

    // indicate trade failed
    MyTradesStore.handleActions({
        type: ActionNames.MY_TRADE_STATUS_UPDATE_FAILED,
        txHash: trades[0].txHash,
    })

    const pendingTrades = MyTradesStore.getAllTrades().filter(t => t.status === TransactionStatus.PENDING)
    expect(pendingTrades.length).toEqual(0)

    const failedTrades = MyTradesStore.getAllTrades().filter(t => t.status === TransactionStatus.FAILED)
    expect(failedTrades.length).toEqual(1)
})

test("failed trades go into local storage if logged in with account", () => {
    // indicate account login
    MyTradesStore.handleActions({
        type: ActionNames.ACCOUNT_RETRIEVED,
        addressNonce: {address: "an address"}
    })

    MyTradesStore.handleActions({
        type: ActionNames.ADD_PENDING_TRADE,
        trade: trades[0],
    })

    // indicate trade failed
    MyTradesStore.handleActions({
        type: ActionNames.MY_TRADE_STATUS_UPDATE_FAILED,
        txHash: trades[0].txHash,
    })

    const pendingTrades = TradesDao.loadPendingTrades("an address")
    expect(pendingTrades.length).toEqual(0)

    const failedTrades = TradesDao.loadFailedTrades("an address")
    expect(failedTrades.length).toEqual(1)
})

test("when account is retrieved, all trades get cleared", () => {
    // add pending trade
    MyTradesStore.handleActions({
        type: ActionNames.ADD_PENDING_TRADE,
        trade: trades[0],
    })

    // add completed
    MyTradesStore.handleActions({
        type: ActionNames.MESSAGE_RECEIVED_TRADES,
        trades: [trades[2]],
    })

    // add pending trade to mark as failed
    MyTradesStore.handleActions({
        type: ActionNames.ADD_PENDING_TRADE,
        trade: trades[1],
    })
    // fail trade
    MyTradesStore.handleActions({
        type: ActionNames.MY_TRADE_STATUS_UPDATE_FAILED,
        txHash: trades[1].txHash,
    })

    // indicate account login
    MyTradesStore.handleActions({
        type: ActionNames.ACCOUNT_RETRIEVED,
        addressNonce: {address: "any address"}
    })

    const allTrades = MyTradesStore.getAllTrades()

    expect(allTrades.length).toEqual(0)
})

