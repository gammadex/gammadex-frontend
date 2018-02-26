import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

class WalletStore extends EventEmitter {
    constructor() {
        super()
        this.walletType = null
        this.keyStoreFile = null
        this.keyStoreFileName = null
        this.keyStorePassword = null
        this.completedAccount = null
        this.completedAccountType = null
        this.fileParseError = null
        this.refreshError = null
    }

    emitChange() {
        this.emit("change")
    }

    getWalletType() {
        return this.walletType
    }

    getKeyStoreFile() {
        return this.keyStoreFile
    }

    getKeyStoreFilename() {
        return this.keyStoreFileName
    }

    getKeyStorePassword() {
        return this.keyStorePassword
    }

    getCompletedAccount() {
        return this.completedAccount
    }

    getCompletedAccountType() {
        return this.completedAccountType
    }

    getFileParseError() {
        return this.fileParseError
    }

    getRefreshError() {
        return this.refreshError
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.WALLET_TYPE_SELECTED: {
                this.walletType = action.walletType
                this.completedAccount = null
                this.completedAccountType = null
                this.refreshError = null
                this.refreshError = null
                this.emitChange()
                break
            }
            case ActionNames.WALLET_SELECTED_KEYSTORE_FILE: {
                this.keyStoreFile = action.keyStoreFile
                this.keyStoreFileName = action.keyStoreFileName
                this.fileParseError = null
                this.emitChange()
                break
            }
            case ActionNames.WALLET_CHANGE_KEYSTORE_FILE: {
                this.completedAccount = null
                this.completedAccountType = null
                this.keyStoreFile = null
                this.keyStoreFileName = null
                this.fileParseError = null
                this.keyStorePassword = null
                this.emitChange()
                break
            }
            case ActionNames.WALLET_INVALID_KEYSTORE_FILE: {
                this.fileParseError = action.error
                this.keyStoreFileName = action.filename
                this.emitChange()
                break
            }
            case ActionNames.WALLET_CHANGE_KEYSTORE_PASSWORD: {
                this.keyStorePassword = action.password
                this.emitChange()
                break
            }
            case ActionNames.ACCOUNT_RETRIEVED: {
                this.completedAccount = action.addressNonce.address
                this.completedAccountType = action.accountType
                this.emitChange()
                break
            }
            case ActionNames.ACCOUNT_REFRESH_ERROR: {
                this.refreshError = action.accountType
                this.refreshError = action.error
                this.emitChange()
                break
            }
        }
    }
}

const walletStore = new WalletStore()
dispatcher.register(walletStore.handleActions.bind(walletStore))

export default walletStore