import BigNumber from 'bignumber.js'
import {weiToGwei, gweiToWei} from '../EtherConversion'

test("check weiToGwei", () => {
    const gwei = weiToGwei(60 * 1000000000)

    let expected = BigNumber("60")

    expect(gwei).toEqual(expected)
})

test("check weiToGwei with a very large number", () => {
    const gwei = weiToGwei(BigNumber("60000000000000000000"))

    let expected = BigNumber("60000000000")

    expect(gwei).toEqual(expected)
})

test("check gweiToWei", () => {
    const gwei = gweiToWei(60)

    let expected = BigNumber("60000000000")

    expect(gwei).toEqual(expected)
})
