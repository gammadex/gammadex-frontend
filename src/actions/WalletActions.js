import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function selectWallet(walletType) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_TYPE_SELECTED,
        walletType
    })
}

export function selectedKeyStoreFile(keyStoreFile, keyStoreFileName) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_SELECTED_KEYSTORE_FILE,
        keyStoreFile,
        keyStoreFileName,
    })
}


export function changeKeyStoreFile() {
    dispatcher.dispatch({
        type: ActionNames.WALLET_CHANGE_KEYSTORE_FILE,
    })
}

export function invalidKeyStoreFile(error, filename) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_INVALID_KEYSTORE_FILE,
        error,
        filename,
    })
}

export function changeKeyStorePassword(password) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_CHANGE_KEYSTORE_PASSWORD,
        password,
    })
}

