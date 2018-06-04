import {cleanMessage} from "../ErrorMessageUtil"

test("nice messages are not clean", () => {
    const message = "No nasty characters here"

    const cleaned = cleanMessage(message)

    expect(cleaned).toEqual("No nasty characters here")
})

test("metamask message gets cleaned", () => {
    const message = "Deposit of 0 ETH failed - Returned error: Error: MetaMask Tx Signature: User denied transaction signature. at t. (chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/background.js:1:43542) at Object.h (chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/background.js:1:579752) at chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/background.js:1:581316 at t.a.emit (chrome-"

    const cleaned = cleanMessage(message)

    expect(cleaned).toEqual("Deposit of 0 ETH failed - Returned error: Error: MetaMask Tx Signature: User denied transaction signature.")
})

test("gas message gets cleaned", () => {
    const message = 'Cancel open order of TST failed - Transaction ran out of gas. Please provide more gas: { "blockHash": "0x06bf212b9ace1132caa031a54e3cfffc4145d2ec92f4a463640ddff5a981d7fb", "blockNumber": 3259735, "contractAddress": null, "cumulativeGasUsed": 1397384, "from": "0xffe373a8400e83691f7ed95edf8c77d2d003793e", "gasUsed": 250000, "logs": [], "logsBloom":'

    const cleaned = cleanMessage(message)

    expect(cleaned).toEqual("Cancel open order of TST failed - Transaction ran out of gas. Please provide more gas.")
})

test("objects do not get cleaned and are returned as they are", () => {
    const message = {}

    const cleaned = cleanMessage(message)

    expect(cleaned).toEqual(message)
})