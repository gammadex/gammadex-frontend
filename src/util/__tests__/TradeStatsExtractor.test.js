import {extractStats} from "../TradeStatsExtractor"

test("check trades before fromDate are not included", () => {
    const trades = [

        {
            "txHash": "0x871ff1cf97cdff6ab5365251198f21b2bfab20e3de488c489f2e4c345d30718c",
            "logIndex": 8,
            "date": "2018-05-17T16:25:00.000Z",
            "price": "0.0010321",
            "side": "sell",
            "amount": "3000",
            "amountBase": "3.0963",
            "buyer": "0x3deE4A4E076e8d82859D241Db0bAF46f112CfA23",
            "seller": "0xf0e5A06e1211be952d8A95c262dF1a2D91FF6895",
            "tokenAddr": "0x4470BB87d77b963A013DB939BE332f927f2b992e"
        },
        { // ignored because date too early
            "txHash": "0x2cd3d9c2f6f641240f2cdec3b8c97c7cc5b6b602f5111b5684998e3616be4843",
            "logIndex": 13,
            "date": "2018-05-15T22:09:21.000Z",
            "price": "0.0010311",
            "side": "sell",
            "amount": "1395.6734",
            "amountBase": "1.43907884274",
            "buyer": "0x3deE4A4E076e8d82859D241Db0bAF46f112CfA23",
            "seller": "0xe58E26770ba6c8121DEB040d90807Ba36E1FBDeA",
            "tokenAddr": "0x4470BB87d77b963A013DB939BE332f927f2b992e"
        },
    ]

    const stats = extractStats(trades, new Date("2018-05-17T10:00:00.000Z"))

    const expected = {
        low: "0.0010321",
        high: "0.0010321",
        tokenVolume: "3000",
        ethVolume: "3.0963",
        last: "0.0010321",
        percentChange: "0",
        tokenAddress: "0x4470BB87d77b963A013DB939BE332f927f2b992e",
    }

    expect(stats).toEqual(expected)
})

test("check volume is sum of trades after fromDate", () => {
    const trades = [

        {
            "txHash": "0x871ff1cf97cdff6ab5365251198f21b2bfab20e3de488c489f2e4c345d30718c",
            "logIndex": 8,
            "date": "2018-05-17T16:25:00.000Z",
            "price": "0.0010321",
            "side": "sell",
            "amount": "3000",
            "amountBase": "3.0963",
            "buyer": "0x3deE4A4E076e8d82859D241Db0bAF46f112CfA23",
            "seller": "0xf0e5A06e1211be952d8A95c262dF1a2D91FF6895",
            "tokenAddr": "0x4470BB87d77b963A013DB939BE332f927f2b992e"
        },
        {
            "txHash": "0x2cd3d9c2f6f641240f2cdec3b8c97c7cc5b6b602f5111b5684998e3616be4843",
            "logIndex": 13,
            "date": "2018-05-15T22:09:21.000Z",
            "price": "0.0010311",
            "side": "sell",
            "amount": "1395.6734",
            "amountBase": "1.43907884274",
            "buyer": "0x3deE4A4E076e8d82859D241Db0bAF46f112CfA23",
            "seller": "0xe58E26770ba6c8121DEB040d90807Ba36E1FBDeA",
            "tokenAddr": "0x4470BB87d77b963A013DB939BE332f927f2b992e"
        },
    ]

    const stats = extractStats(trades, new Date("2018-05-15T10:00:00.000Z"))

    const expected = {
        low: "0.0010311",
        high: "0.0010321",
        tokenVolume: "4395.6734",
        ethVolume: "4.53537884274",
        last: "0.0010311",
        percentChange: "0.096983803704781302",
        tokenAddress: "0x4470BB87d77b963A013DB939BE332f927f2b992e",
    }

    expect(stats).toEqual(expected)
})