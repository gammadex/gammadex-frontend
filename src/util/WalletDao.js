import AccountType from "../AccountType"

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

export function saveDebugWallet(address) {
    const wallet = {
        type: AccountType.DEBUG,
        data: {
            address,
        }
    }

    localStorage.wallet = JSON.stringify(wallet)
}

export function readWallet() {
    return localStorage.wallet ? JSON.parse(localStorage.wallet) : null
}
