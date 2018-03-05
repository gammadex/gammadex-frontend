import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function selectWallet(accountType) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_TYPE_SELECTED,
        selectedAccountType: accountType
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

export function passwordError(error) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_PASSWORD_ERROR,
        error
    })
}

export function changedKeyStoreRememberMe(isRememberMe) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_CHANGE_REMEMBER_KEYSTORE,
        isRememberMe,
    })
}

export function hideUnlockKeyStoreModal() {
    dispatcher.dispatch({
        type: ActionNames.WALLET_HIDE_UNLOCK_KEYSTORE_MODAL,
    })
}

export function changedPrivateKeyRememberMe(isRememberMe) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_CHANGE_REMEMBER_PRIVATE_KEY,
        isRememberMe,
    })
}

export function hideUnlockPrivateKeyModal() {
    dispatcher.dispatch({
        type: ActionNames.WALLET_HIDE_UNLOCK_PRIVATE_KEY_MODAL,
    })
}

export function changePrivateKeyUnlockPassword(password) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_CHANGE_PRIVATE_KEY_UNLOCK_PASSWORD,
        password,
    })
}

export function changePrivateKeyPasswords(password, confirmPasssword, passwordError, confirmPasswordError) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_CHANGE_PRIVATE_KEY_PASSWORDS,
        password,
        confirmPasssword,
        passwordError,
        confirmPasswordError,
    })
}

export function changeUsePrivateKeyEncryption(isUseEncryption) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_CHANGE_USE_PRIVATE_KEY_ENCRYPTION,
        isUseEncryption,
    })
}

export function keyStorePasswordError(error) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_KEYSTORE_PASSWORD_ERROR,
        error
    })
}

export function logout() {
    dispatcher.dispatch({
        type: ActionNames.WALLET_LOGOUT,
    })
}

export function updateProvidedWeb3Available(isAvailable) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_UPDATE_PROVIDED_WEB3_AVAILABLE,
        isAvailable,
    })
}

export function updateProvidedWeb3Net(isMainNet, description) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_UPDATE_PROVIDED_WEB3_NET,
        isMainNet,
        description,
    })
}

export function updateProvidedWeb3AccountAvailable(isAvailable) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_UPDATE_PROVIDED_WEB3_ACCOUNT_AVAILABLE,
        isAvailable,
    })
}
