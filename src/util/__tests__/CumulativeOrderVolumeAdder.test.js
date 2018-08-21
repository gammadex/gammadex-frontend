import {cumulativeAdd} from "../CumulativeOrderVolumeAdder"

test("test sells get added", () => {
    const sells = [{
        "ethAvailableVolume": "1",
        "price": "0.02"
    }, {
        "ethAvailableVolume": "2",
        "price": "0.03"
    }]

    const result = cumulativeAdd(sells)

    expect(result).toEqual({prices: [0.02, 0.03], volumes: [1, 3]})
})

test("test buys get added", () => {
    const buys = [{
        "ethAvailableVolume": "2",
        "price": "0.03"
    }, {
        "ethAvailableVolume": "3",
        "price": "0.025"
    }]

    const result = cumulativeAdd(buys)

    expect(result).toEqual({prices: [0.03, 0.025], volumes: [2, 5]})
})

test("test buys get added excluding outliers", () => {
    const buys = Array(3).fill({
        "ethAvailableVolume": "1",
        "price": "0.03"
    })

    buys.push({
        "ethAvailableVolume": "1",
        "price": "0.04"
    })

    buys.push({
        "ethAvailableVolume": "1",
        "price": "0.0002"
    })

    const result = cumulativeAdd(buys, 'bids')

    expect(result).toEqual({prices: [0.03, 0.03, 0.03, 0.04], volumes: [4, 3, 2, 1]})
})

test("test offers get added excluding outliers", () => {
    const buys = Array(3).fill({
        "ethAvailableVolume": "1",
        "price": "0.01"
    })

    buys.push({
        "ethAvailableVolume": "1",
        "price": "0.001"
    })

    buys.push({
        "ethAvailableVolume": "1",
        "price": "2.0"
    })

    const result = cumulativeAdd(buys, 'offers')

    expect(result).toEqual({prices: [0.001, 0.01, 0.01, 0.01], volumes: [1, 2, 3, 4]})
})


