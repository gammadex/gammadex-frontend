import * as StatsUtil from '../StatsUtil'

const volumes = [
    {"volumeInEth": 721, "tokenName": "Basic Attention Token", "tokenSymbol": "BAT", "tokenAddress": "0x0D8775F648430679A709E98d2b0Cb6250d2887EF"},
    {"volumeInEth": 113, "tokenName": "Kin", "tokenSymbol": "KIN", "tokenAddress": "0x818Fc6C2Ec5986bc6E2CBf00939d90556aB12ce5"},
    {"volumeInEth": 52, "tokenName": "Countinghouse Fund", "tokenSymbol": "CHT", "tokenAddress": "0x799d214d7143B766cDd4979cd0280939288ba931"},
    {"volumeInEth": 42, "tokenName": "Veritaseum", "tokenSymbol": "VERI", "tokenAddress": "0x8f3470A7388c05eE4e7AF3d01D8C722b0FF52374"}
]

test("take top 2", () => {
    const top = StatsUtil.topStats(volumes, 2, false)

    expect(top).toEqual([
        {"tokenAddress": "0x0D8775F648430679A709E98d2b0Cb6250d2887EF", "tokenName": "Basic Attention Token", "tokenSymbol": "BAT", "volumeInEth": 721},
        {"tokenAddress": "0x818Fc6C2Ec5986bc6E2CBf00939d90556aB12ce5", "tokenName": "Kin", "tokenSymbol": "KIN", "volumeInEth": 113}]
    )
})

test("take top 2 with others", () => {
    const top = StatsUtil.topStats(volumes, 2, true)

    expect(top).toEqual([
        {"tokenAddress": "0x0D8775F648430679A709E98d2b0Cb6250d2887EF", "tokenName": "Basic Attention Token", "tokenSymbol": "BAT", "volumeInEth": 721},
        {"tokenAddress": "0x818Fc6C2Ec5986bc6E2CBf00939d90556aB12ce5", "tokenName": "Kin", "tokenSymbol": "KIN", "volumeInEth": 113},
        {"tokenAddress": null, "tokenName": "other", "tokenSymbol": "other", "volumeInEth": 94}]
    )
})

test("other is absent when taking all tokens", () => {
    const top = StatsUtil.topStats(volumes, 4, true)

    expect(top.length).toEqual(4)
})