import * as EthJsUtil from "ethereumjs-util"
import keythereum from "keythereum"

export function removeHexPrefix(str) {
    return (str || "").replace(/^0x/, "")
}

export function addressesLooselyMatch(address1, address2) {
    return removeHexPrefix(String(address1)).toLowerCase() === removeHexPrefix(String(address2)).toLowerCase()
}

export function symbolsLooselyMatch(symbol1, symbol2) {
    return String(symbol1).toLowerCase() === String(symbol2).toLowerCase()
}

export function convertPrivateKeyToAddress(privateKey) {
    const keyBuffer = EthJsUtil.toBuffer(EthJsUtil.addHexPrefix(privateKey))
    const noHexPrefixKey = removeHexPrefix(privateKey)
    const isValid = EthJsUtil.isValidPrivate(keyBuffer)
    const address = (isValid) ? EthJsUtil.bufferToHex(EthJsUtil.privateToAddress(keyBuffer)) : ""

    return {noHexPrefixKey, isValid, address}
}

export function convertKeyFileToAddressAndKey(file, password) {
    const privateKeyBuffer = keythereum.recover(password, file)
    const address = EthJsUtil.bufferToHex(EthJsUtil.privateToAddress(privateKeyBuffer))
    const privateKey = removeHexPrefix(EthJsUtil.bufferToHex(privateKeyBuffer))

    return {address, privateKey}
}
