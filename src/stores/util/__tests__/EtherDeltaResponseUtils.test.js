import {removeDups} from "../EtherDeltaResponseUtils"

test("dups get removed", () => {
    const listWithDups = [{txHash: 1}, {txHash: 2}, {txHash: 1}]

    const cleaned = removeDups(listWithDups)

    const expected = [{txHash: 1}, {txHash: 2}]

    expect(cleaned).toEqual(expected)
})