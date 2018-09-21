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

const byDayVolumes = [
    {
        "volumeInEth": 250.252059933499,
        "tokenName": "Veritaseum",
        "tokenSymbol": "VERI",
        "tokenAddress": "0x8f3470A7388c05eE4e7AF3d01D8C722b0FF52374",
        "startTime": "2018-08-19T00:00:00.000Z"
    },
    {
        "volumeInEth": 131.686445375436,
        "tokenName": "Populous Platform",
        "tokenSymbol": "PPT",
        "tokenAddress": "0xd4fa1460F537bb9085d22C7bcCB5DD450Ef28e3a",
        "startTime": "2018-08-19T00:00:00.000Z"
    },
    {
        "volumeInEth": 49.2912494618419,
        "tokenName": "HashRush",
        "tokenSymbol": "RC",
        "tokenAddress": "0x2DBE0f03f1dddbdbc87557e86dF3878AE25af855",
        "startTime": "2018-08-19T00:00:00.000Z"
    },
    {
        "volumeInEth": 38.7953554714131,
        "tokenName": "Imdex",
        "tokenSymbol": "IMDX",
        "tokenAddress": "0x5c3bB81d0E1391361b3198D02fE883dfF1ba70ad",
        "startTime": "2018-08-19T00:00:00.000Z"
    },
    {
        "volumeInEth": 864.08670413176,
        "tokenName": "Veritaseum",
        "tokenSymbol": "VERI",
        "tokenAddress": "0x8f3470A7388c05eE4e7AF3d01D8C722b0FF52374",
        "startTime": "2018-08-20T00:00:00.000Z"
    },
    {
        "volumeInEth": 622.599274268568,
        "tokenName": "Kin",
        "tokenSymbol": "KIN",
        "tokenAddress": "0x818Fc6C2Ec5986bc6E2CBf00939d90556aB12ce5",
        "startTime": "2018-08-20T00:00:00.000Z"
    },
    {
        "volumeInEth": 93.9669732132908,
        "tokenName": "Insureum Token",
        "tokenSymbol": "ISR",
        "tokenAddress": "0xB16d3Ed603D62b125c6bd45519EDa40829549489",
        "startTime": "2018-08-20T00:00:00.000Z"
    },
    {
        "volumeInEth": 79.6733332402048,
        "tokenName": "Spectre.ai D-Token",
        "tokenSymbol": "SXDT",
        "tokenAddress": "0x12B306fA98F4CbB8d4457FdFf3a0A0a56f07cCdf",
        "startTime": "2018-08-20T00:00:00.000Z"
    },


    {
        "volumeInEth": 121.863776405685,
        "tokenName": "Veritaseum",
        "tokenSymbol": "VERI",
        "tokenAddress": "0x8f3470A7388c05eE4e7AF3d01D8C722b0FF52374",
        "startTime": "2018-08-21T00:00:00.000Z"
    },
    {
        "volumeInEth": 113.533982813429,
        "tokenName": "Spectre.ai D-Token",
        "tokenSymbol": "SXDT",
        "tokenAddress": "0x12B306fA98F4CbB8d4457FdFf3a0A0a56f07cCdf",
        "startTime": "2018-08-21T00:00:00.000Z"
    },
    {
        "volumeInEth": 69.9210627239814,
        "tokenName": "Imdex",
        "tokenSymbol": "IMDX",
        "tokenAddress": "0x5c3bB81d0E1391361b3198D02fE883dfF1ba70ad",
        "startTime": "2018-08-21T00:00:00.000Z"
    },
    {
        "volumeInEth": 68.0638964802442,
        "tokenName": "Insureum Token",
        "tokenSymbol": "ISR",
        "tokenAddress": "0xB16d3Ed603D62b125c6bd45519EDa40829549489",
        "startTime": "2018-08-21T00:00:00.000Z"
    }
]

test("take top 2 range by day", () => {
    const top = StatsUtil.topStatsByDay(byDayVolumes, 2, false)

    expect(top).toEqual({
        "dates": ["2018-08-19T00:00:00.000Z", "2018-08-20T00:00:00.000Z", "2018-08-21T00:00:00.000Z"],
        "tokens": [
            {"token": {"tokenAddress": "0x8f3470A7388c05eE4e7AF3d01D8C722b0FF52374", "tokenName": "Veritaseum", "tokenSymbol": "VERI"}, "volumes": [250.252059933499, 864.08670413176, 121.863776405685]},
            {"token": {"tokenAddress": "0x818Fc6C2Ec5986bc6E2CBf00939d90556aB12ce5", "tokenName": "Kin", "tokenSymbol": "KIN"}, "volumes": [0, 622.599274268568, 0]}]})
})