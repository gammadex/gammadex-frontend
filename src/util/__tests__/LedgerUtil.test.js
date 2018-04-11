import {stripDerivationPathPrefix, isDerivationPathValid} from '../LedgerUtil'

test("Full path gets stripped", () => {
    const stripped = stripDerivationPathPrefix("m/44'/60'/0'")

    expect(stripped).toEqual("44'/60'/0'")
})

test("Already stripped path remains same", () => {
    const stripped = stripDerivationPathPrefix("44'/60'/0'")

    expect(stripped).toEqual("44'/60'/0'")
})

test("Valid derivation path matches", () => {
    const valid = isDerivationPathValid("m/44'/60'/0'")

    expect(valid).toEqual(true)
})

test("Valid derivation path with invalid coin type does not match", () => {
    const valid = isDerivationPathValid("m/44'/62'/0'")

    expect(valid).toEqual(false)
})

test("Valid derivation path without m prefix does not match", () => {
    const valid = isDerivationPathValid("a/44'/61'/0'")

    expect(valid).toEqual(false)
})