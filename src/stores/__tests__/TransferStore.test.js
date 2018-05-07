import TransferStore from "../TransferStore"
import ActionNames from "../../actions/ActionNames"
import transfers from "./transfers.json"
import TransactionStatus from "../../TransactionStatus"
import * as TransfersDao from "../../util/TransfersDao"

beforeEach(() => {
    global.localStorage = {}
    TransferStore.clearTransfers()
})

test("transfers from funds message go into the completed pool", () => {
    TransferStore.handleActions({
        type: ActionNames.MESSAGE_RECEIVED_FUNDS,
        funds: [transfers[0]],
    })

    const completeTransfers = TransferStore.getAllTransfers().filter(t => t.status === TransactionStatus.COMPLETE)
    expect(completeTransfers.length).toEqual(1)
})

test("transfers from funds message won't add duplicates", () => {
    TransferStore.handleActions({
        type: ActionNames.MESSAGE_RECEIVED_FUNDS,
        funds: [transfers[0]],
    })

    TransferStore.handleActions({
        type: ActionNames.MESSAGE_RECEIVED_FUNDS,
        funds: [transfers[0]],
    })

    const completeTransfers = TransferStore.getAllTransfers().filter(t => t.status === TransactionStatus.COMPLETE)
    expect(completeTransfers.length).toEqual(1)
})

test("transfers from funds message get removed from the pending pool", () => {
    TransferStore.handleActions({
        type: ActionNames.MESSAGE_RECEIVED_FUNDS,
        funds: [transfers[0]],
    })

    const completeTransfers = TransferStore.getAllTransfers().filter(t => t.status === TransactionStatus.COMPLETE)
    expect(completeTransfers.length).toEqual(1)
})

test("pending transfers go into the pending pool", () => {
    TransferStore.handleActions({
        type: ActionNames.ADD_PENDING_TRANSFER,
        transfer: transfers[0],
    })

    const pendingTransfers = TransferStore.getAllTransfers().filter(t => t.status === TransactionStatus.PENDING)
    expect(pendingTransfers.length).toEqual(1)
})

test("pending transfers go into local storage if logged in with account", () => {
    // indicate account login
    TransferStore.handleActions({
        type: ActionNames.ACCOUNT_RETRIEVED,
        addressNonce: {address: "an address"}
    })

    TransferStore.handleActions({
        type: ActionNames.ADD_PENDING_TRANSFER,
        transfer: transfers[0],
    })

    const pendingTransfers = TransfersDao.loadPendingTransfers("an address")
    expect(pendingTransfers.length).toEqual(1)
})

test("when a pending transfer succeeds it gets removed from the pending pool into the completed pool", () => {
    // add pending transfer
    TransferStore.handleActions({
        type: ActionNames.ADD_PENDING_TRANSFER,
        transfer: transfers[0],
    })

    // indicate transfer succeeded
    TransferStore.handleActions({
        type: ActionNames.TRANSFER_SUCCEEDED,
        txHash: transfers[0].txHash,
    })

    const pendingTransfers = TransferStore.getAllTransfers().filter(t => t.status === TransactionStatus.PENDING)
    expect(pendingTransfers.length).toEqual(0)

    const completedTransfers = TransferStore.getAllTransfers().filter(t => t.status === TransactionStatus.COMPLETE)
    expect(completedTransfers.length).toEqual(1)
})

test("when a pending transfer succeeds other completed transfers are still in the completed pool", () => {
    TransferStore.handleActions({
        type: ActionNames.MESSAGE_RECEIVED_FUNDS,
        funds: [transfers[0]],
    })


    // add pending transfer
    TransferStore.handleActions({
        type: ActionNames.ADD_PENDING_TRANSFER,
        transfer: transfers[1],
    })

    // indicate transfer succeeded
    TransferStore.handleActions({
        type: ActionNames.TRANSFER_SUCCEEDED,
        txHash: transfers[1].txHash,
    })

    const completedTransfers = TransferStore.getAllTransfers().filter(t => t.status === TransactionStatus.COMPLETE)
    expect(completedTransfers.length).toEqual(2)
})

test("when a pending transfer fails it gets removed from the pending pool and gets added to the failed pool", () => {
    // add pending transfer
    TransferStore.handleActions({
        type: ActionNames.ADD_PENDING_TRANSFER,
        transfer: transfers[0],
    })

    // indicate transfer failed
    TransferStore.handleActions({
        type: ActionNames.TRANSFER_FAILED,
        txHash: transfers[0].txHash,
    })

    const pendingTransfers = TransferStore.getAllTransfers().filter(t => t.status === TransactionStatus.PENDING)
    expect(pendingTransfers.length).toEqual(0)

    const failedTransfers = TransferStore.getAllTransfers().filter(t => t.status === TransactionStatus.FAILED)
    expect(failedTransfers.length).toEqual(1)
})

test("failed transfers go into local storage if logged in with account", () => {
    // indicate account login
    TransferStore.handleActions({
        type: ActionNames.ACCOUNT_RETRIEVED,
        addressNonce: {address: "an address"}
    })

    TransferStore.handleActions({
        type: ActionNames.ADD_PENDING_TRANSFER,
        transfer: transfers[0],
    })

    // indicate transfer failed
    TransferStore.handleActions({
        type: ActionNames.TRANSFER_FAILED,
        txHash: transfers[0].txHash,
    })

    const pendingTransfers = TransfersDao.loadPendingTransfers("an address")
    expect(pendingTransfers.length).toEqual(0)

    const failedTransfers = TransfersDao.loadFailedTransfers("an address")
    expect(failedTransfers.length).toEqual(1)
})

test("when account is retrieved, all transfers get cleared", () => {
    // add pending transfer
    TransferStore.handleActions({
        type: ActionNames.ADD_PENDING_TRANSFER,
        transfer: transfers[0],
    })

    // add completed
    TransferStore.handleActions({
        type: ActionNames.MESSAGE_RECEIVED_FUNDS,
        funds: [transfers[2]],
    })

    // add pending transfer to mark as failed
    TransferStore.handleActions({
        type: ActionNames.ADD_PENDING_TRANSFER,
        transfer: transfers[1],
    })
    // fail transfer
    TransferStore.handleActions({
        type: ActionNames.TRANSFER_FAILED,
        txHash: transfers[1].txHash,
    })

    // indicate account login
    TransferStore.handleActions({
        type: ActionNames.ACCOUNT_RETRIEVED,
        addressNonce: {address: "any address"}
    })

    const allTransfers = TransferStore.getAllTransfers()

    expect(allTransfers.length).toEqual(0)
})

