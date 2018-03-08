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
