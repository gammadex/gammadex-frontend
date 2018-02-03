import {mergeOrders} from "../OrderMerger"

test("orders with wrong different token address don't get added", () => {
    const existing = [{id: 'sell_0x1', price: '0.1', tokenGive: '0x1', tokenGet: '0x0'}]
    const incoming = [{id: 'sell_0x2', price: '0.1', tokenGive: '0x2', tokenGet: '0x0'}]

    const merged = mergeOrders(existing, incoming, '0x1')

    expect(merged).toEqual(existing)
})

test("changed orders with same token address get added", () => {
    const existing = [{id: 'sell_0x1', price: '0.1', tokenGet: '0x0', tokenGive: '0x1'}]
    const incoming = [{id: 'sell_0x2', price: '0.1', tokenGet: '0x0', tokenGive: '0x1'}]

    const merged = mergeOrders(existing, incoming, '0x1')

    const expected = [
        {id: 'sell_0x1', price: '0.1', tokenGet: '0x0', tokenGive: '0x1'},
        {id: 'sell_0x2', price: '0.1', tokenGet: '0x0', tokenGive: '0x1'}
    ]

    expect(merged).toEqual(expected)
})

test("changed orders with marked for delete get deleted", () => {
    const existing = [{id: 'sell_0x1', price: '0.1', tokenGet: '0x0', tokenGive: '0x1'}]
    const incoming = [{id: 'sell_0x1', price: '0.1', tokenGet: '0x0', tokenGive: '0x1', 'delete': 'true'}]

    const merged = mergeOrders(existing, incoming, '0x1')

    const expected = []

    expect(merged).toEqual(expected)
})

test("changed adds are in ascending order when requested", () => {
    const existing = [{id: 'buy_0x1', price: '0.2', tokenGive: '0x0', tokenGet: '0x1'}]
    const incoming = [{id: 'buy_0x2', price: '0.1', tokenGive: '0x0', tokenGet: '0x1'}]

    const merged = mergeOrders(existing, incoming, '0x1', true)

    const expected = [
        {id: 'buy_0x2', price: '0.1', tokenGive: '0x0', tokenGet: '0x1'},
        {id: 'buy_0x1', price: '0.2', tokenGive: '0x0', tokenGet: '0x1'}
    ]

    expect(merged).toEqual(expected)
})

test("changed adds are in descending order when requested", () => {
    const existing = [{id: 'sell_0x1', price: '0.1', tokenGet: '0x0', tokenGive: '0x1'}]
    const incoming = [{id: 'sell_0x2', price: '0.2', tokenGet: '0x0', tokenGive: '0x1'}]

    const merged = mergeOrders(existing, incoming, '0x1', false)

    const expected = [
        {id: 'sell_0x2', price: '0.2', tokenGet: '0x0', tokenGive: '0x1'},
        {id: 'sell_0x1', price: '0.1', tokenGet: '0x0', tokenGive: '0x1'},
    ]

    expect(merged).toEqual(expected)
})
