import AccountType from "../AccountType"
import _ from "lodash"

export function prefixWith0x(address) {
    return (_.isString(address) && address.startsWith('0x')) ? address : `0x${address}`
}

export function forgetStoredWallet() {
    localStorage.removeItem("wallet")
}

export function isWalletSaved(accountType) {
    if (localStorage.wallet) {
        return readWallet().type === accountType
    } else {
        return false
    }
}

export function saveKeyStoreWallet(keyStoreFile, keyStoreFileName) {
    const wallet = {
        type: AccountType.KEY_STORE_FILE,
        data: {
            address: prefixWith0x(keyStoreFile.address),
            file: keyStoreFile,
            fileName: keyStoreFileName
        }
    }

    localStorage.wallet = JSON.stringify(wallet)
}

export function savePrimaryKeyWallet(address, key, encrypted) {
    const wallet = {
        type: AccountType.PRIVATE_KEY,
        data: {
            address: address,
            key: key,
            encrypted: encrypted
        }
    }

    localStorage.wallet = JSON.stringify(wallet)
}

export function saveMetamaskWallet() {
    const wallet = {
        type: AccountType.METAMASK,
    }

    localStorage.wallet = JSON.stringify(wallet)
}

export function saveViewOnlyWallet(address) {
    const wallet = {
        type: AccountType.VIEW,
        data: {
            address,
        }
    }

    localStorage.wallet = JSON.stringify(wallet)
}

export function readWallet() {
    return localStorage.wallet ? JSON.parse(localStorage.wallet) : null
}
