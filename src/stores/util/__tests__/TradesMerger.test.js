import {mergeAndSortTrades} from "../TradesMerger"

test("trades different token address don't get added", () => {
    const existing = [{txHash: '0x999', tokenAddr: '0x1'}]
    const incoming = [{txHash: '0x100', tokenAddr: '0x2'}]

    const merged = mergeAndSortTrades(existing, incoming, '0x1')

    expect(merged).toEqual(existing)
})

test("trades are sorted in descending time order once merged", () => {
    const existing = [{txHash: '0x999', tokenAddr: '0x1', date: '2018-02-03T10:00:00.000Z'}]
    const incoming = [{txHash: '0x100', tokenAddr: '0x1', date: '2018-02-03T12:00:00.000Z'}]

    const merged = mergeAndSortTrades(existing, incoming, '0x1')

    const expected = [
        {txHash: '0x100', tokenAddr: '0x1', date: '2018-02-03T12:00:00.000Z'},
        {txHash: '0x999', tokenAddr: '0x1', date: '2018-02-03T10:00:00.000Z'},
    ]

    expect(merged).toEqual(expected)
})

test("trades have duplicated removed", () => {
    const existing = [{txHash: '0x999', tokenAddr: '0x1', date: '2018-02-03T10:00:00.000Z'}]
    const incoming = [{txHash: '0x999', tokenAddr: '0x1', date: '2018-02-03T12:00:00.000Z'}]

    const merged = mergeAndSortTrades(existing, incoming, '0x1')

    const expected = [
        {txHash: '0x999', tokenAddr: '0x1', date: '2018-02-03T10:00:00.000Z'},
    ]

    expect(merged).toEqual(expected)
})
