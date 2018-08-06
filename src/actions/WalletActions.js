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

export function changedMetamaskRememberMe(isRememberMe) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_CHANGE_REMEMBER_METAMASK,
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

export function accountCreated(account) {
    dispatcher.dispatch({
        type: ActionNames.ACCOUNT_CREATED,
        account
    })
}

export function keyStoreCreated(keyStore, keyStoreFileName) {
    dispatcher.dispatch({
        type: ActionNames.KEYSTORE_CREATED,
        keyStore,
        keyStoreFileName
    })
}

export function newAccountShowPrivateKeyUpdated(newAccountShowPrivateKey) {
    dispatcher.dispatch({
        type: ActionNames.NEW_ACCOUNT_SHOW_PRIVATE_KEY_UPDATED,
        newAccountShowPrivateKey
    })
}

export function resetNewAccountWorkflow() {
    dispatcher.dispatch({
        type: ActionNames.RESET_NEW_ACCOUNT_WORKFLOW,
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

export function updateWeb3IsConnected(connected) {
    dispatcher.dispatch({
        type: ActionNames.WEB3_UPDATE_IS_CONNECTED,
        connected,
    })
}

export function ledgerAccountsRequested(deriviationPath) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_LEDGER_ACCOUNTS_REQUESTED,
        deriviationPath,
    })
}

export function ledgerError(errorMessage, errorName) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_LEDGER_ERROR,
        errorMessage,
        errorName
    })
}

export function ledgerAccountsRetrieved(accounts, page) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_LEDGER_ACCOUNTS_RETRIEVED,
        accounts,
        page
    })
}

export function ledgerDerivationPathSourceSelected(derivationPathSource) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_LEDGER_DERIVATION_PATH_SOURCE_SELECTED,
        derivationPathSource,
    })
}

export function changeLedgerAddressPage(page) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_LEDGER_CHANGE_ADDRESS_PAGE,
        page,
    })
}

export function changeLedgerAddressOffset(offset) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_LEDGER_CHANGE_ADDRESS_OFFSET,
        offset,
    })
}

export function changeCustomDerivationPath(derivationPath) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_LEDGER_CHANGE_CUSTOM_DERIVATION_PATH,
        derivationPath,
    })
}

export function metamaskNetworkWarningSent(messageId) {
    dispatcher.dispatch({
        type: ActionNames.METAMASK_NETWORK_WARNING_SENT,
        messageId
    })
}
