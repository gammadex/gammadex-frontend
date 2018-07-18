import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import * as WalletDao from "../util/WalletDao"
import AccountType from "../AccountType"

class WalletStore extends EventEmitter {
    LEDGER_DEFAULTS = {
        accounts: [],
        errorName: null,
        errorMessage: null,
        selectedDerivationPathSource: "default", // default or custom
        customDerivationPath: "",
        addressPage: 0,
        addressOffset: null
    }

    constructor() {
        super()
        this.selectedAccountType = null
        this.keyStoreFile = null
        this.keyStoreFileName = null
        this.keyStorePassword = null
        this.newAccount = null
        this.newAccountKeyStore = null
        this.newAccountKeyStoreFileName = null
        this.newAccountShowPrivateKey = false
        this.rememberKeyStoreFile = false
        this.rememberPrivateKey = true
        this.unlocked = false
        this.completedAccount = null
        this.fileParseError = null
        this.refreshError = null
        this.passwordError = null
        this.privateKeyPassword = ""
        this.confirmPrivateKeyPassword = ""
        this.privateKeyUnlockPassword = ""
        this.privateKeyPasswordError = null
        this.confirmPrivateKeyPasswordError = null
        this.useEncryption = true
        this.keyStorePasswordError = null
        this.rememberMetamask = true
        this.metamastNetworkWarningSentMessageId = null

        this.displayUnlockKeyStoreModal = WalletDao.isWalletSaved(AccountType.KEY_STORE_FILE) && !this.unlocked
        this.displayUnlockPrivateKeyModal = WalletDao.isWalletSaved(AccountType.PRIVATE_KEY) && WalletDao.readWallet().data.encrypted && !this.unlocked

        const localStoreWallet = WalletDao.readWallet()
        if (localStoreWallet) {
            if (localStoreWallet.type === AccountType.KEY_STORE_FILE) {
                this.keyStoreFileName = localStoreWallet.data.fileName
            }
        }

        this.providedWeb3 = {
            connected: true, // connection status updated whenever we lookup block number (on a timer)
            available: null,
            isMainNet: null,
            netDescription: null,
            accountAvailable: null
        }

        this.resetLedgerValues()
    }

    emitChange() {
        this.emit("change")
    }

    getSelectedAccountType() {
        return this.selectedAccountType
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

    getFileParseError() {
        return this.fileParseError
    }

    getRefreshError() {
        return this.refreshError
    }

    isRememberKeyStoreFile() {
        return this.rememberKeyStoreFile
    }

    isDisplayUnlockKeyStoreModal() {
        return this.displayUnlockKeyStoreModal
    }

    getPasswordError() {
        return this.passwordError
    }

    isRememberPrivateKey() {
        return this.rememberPrivateKey
    }

    isDisplayUnlockPrivateKeyModal() {
        return this.displayUnlockPrivateKeyModal
    }

    getPrivateKeyPassword() {
        return this.privateKeyPassword
    }

    getConfirmPrivateKeyPassword() {
        return this.confirmPrivateKeyPassword
    }

    getPrivateKeyPasswordError() {
        return this.privateKeyPasswordError
    }

    getConfirmPrivateKeyPasswordError() {
        return this.confirmPrivateKeyPasswordError
    }

    getPrivateKeyUnlockPassword() {
        return this.privateKeyUnlockPassword
    }

    getUsePrivateKeyEncryption() {
        return this.useEncryption
    }

    getKeyStorePasswordError() {
        return this.keyStorePasswordError
    }

    getProvidedWeb3Info() {
        return this.providedWeb3
    }

    isProvidedWeb3Available() {
        return this.providedWeb3.available
    }

    isProvidedWeb3AccountAvailable() {
        return this.providedWeb3.accountAvailable
    }

    isRememberMetamask() {
        return this.rememberMetamask
    }

    getLedger() {
        return this.ledger
    }

    resetLedgerValues() {
        this.ledger = Object.assign({}, this.LEDGER_DEFAULTS)
    }

    getNewAccount() {
        return this.newAccount
    }

    getNewAccountKeyStore() {
        return this.newAccountKeyStore
    }

    getNewAccountKeyStoreFileName() {
        return this.newAccountKeyStoreFileName
    }

    getNewAccountShowPrivateKey() {
        return this.newAccountShowPrivateKey
    }

    isMetamastNetworkWarningSentMessageId() {
        return this.metamastNetworkWarningSentMessageId
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.WALLET_TYPE_SELECTED: {
                this.selectedAccountType = action.selectedAccountType
                this.completedAccount = null
                this.keyStoreFile = null
                this.keyStoreFileName = null
                this.fileParseError = null
                this.refreshError = null
                this.privateKeyPassword = ""
                this.confirmPrivateKeyPassword = ""
                this.privateKeyUnlockPassword = ""
                this.privateKeyPasswordError = null
                this.confirmPrivateKeyPasswordError = null
                this.keyStorePasswordError = null
                this.rememberKeyStoreFile = false
                this.rememberPrivateKey = false
                this.rememberMetamask = false
                this.resetLedgerValues()
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
            case ActionNames.ACCOUNT_CREATED: {
                this.newAccount = action.account
                this.newAccountKeyStore = action.keyStore
                this.newAccountKeyStoreFileName = action.keyStoreFileName
                this.emitChange()
                break
            }    
            case ActionNames.NEW_ACCOUNT_SHOW_PRIVATE_KEY_UPDATED: {
                this.newAccountShowPrivateKey = action.newAccountShowPrivateKey
                this.emitChange()
                break
            }     
            case ActionNames.RESET_NEW_ACCOUNT_WORKFLOW: {
                this.newAccount = null
                this.newAccountKeyStore = null
                this.newAccountKeyStoreFileName = null
                this.newAccountShowPrivateKey = false
                this.emitChange()
                break
            }                                    
            case ActionNames.ACCOUNT_RETRIEVED: {
                this.completedAccount = action.addressNonce.address
                this.displayUnlockKeyStoreModal = false
                this.displayUnlockPrivateKeyModal = false
                this.unlocked = true
                this.passwordError = null
                this.emitChange()
                break
            }
            case ActionNames.ACCOUNT_REFRESH_ERROR: {
                this.refreshError = action.error
                this.emitChange()
                break
            }
            case ActionNames.WALLET_CHANGE_REMEMBER_KEYSTORE: {
                this.rememberKeyStoreFile = action.isRememberMe
                this.emitChange()
                break
            }
            case ActionNames.WALLET_CHANGE_REMEMBER_METAMASK: {
                this.rememberMetamask = action.isRememberMe
                this.emitChange()
                break
            }
            case ActionNames.WALLET_HIDE_UNLOCK_KEYSTORE_MODAL: {
                this.displayUnlockKeyStoreModal = false
                this.emitChange()
                break
            }
            case ActionNames.WALLET_PASSWORD_ERROR: {
                this.passwordError = action.error
                this.emitChange()
                break
            }
            case ActionNames.WALLET_CHANGE_REMEMBER_PRIVATE_KEY: {
                this.rememberPrivateKey = action.isRememberMe
                if (!action.isRememberMe) {
                    this.useEncryption = true
                }
                this.emitChange()
                break
            }
            case ActionNames.WALLET_CHANGE_USE_PRIVATE_KEY_ENCRYPTION: {
                this.useEncryption = action.isUseEncryption
                if (!action.isUseEncryption) {
                    this.privateKeyPassword = ""
                    this.privateKeyPasswordError = null
                    this.confirmPrivateKeyPassword = ""
                    this.confirmPrivateKeyPasswordError = null
                }
                this.emitChange()
                break
            }
            case ActionNames.WALLET_HIDE_UNLOCK_PRIVATE_KEY_MODAL: {
                this.displayUnlockPrivateKeyModal = false
                this.emitChange()
                break
            }
            case ActionNames.WALLET_CHANGE_PRIVATE_KEY_UNLOCK_PASSWORD: {
                this.privateKeyUnlockPassword = action.password
                this.emitChange()
                break
            }
            case ActionNames.WALLET_CHANGE_PRIVATE_KEY_PASSWORDS: {
                this.privateKeyPassword = action.password
                this.confirmPrivateKeyPassword = action.confirmPasssword
                this.privateKeyPasswordError = action.passwordError
                this.confirmPrivateKeyPasswordError = action.confirmPasswordError
                this.emitChange()
                break
            }
            case ActionNames.WALLET_KEYSTORE_PASSWORD_ERROR: {
                this.keyStorePasswordError = action.error
                this.emitChange()
                break
            }
            case ActionNames.WALLET_LOGOUT: {
                this.completedAccount = null
                this.emitChange()
                break
            }
            case ActionNames.WALLET_UPDATE_PROVIDED_WEB3_AVAILABLE: {
                this.providedWeb3.available = action.isAvailable
                this.emitChange()
                break
            }
            case ActionNames.WALLET_UPDATE_PROVIDED_WEB3_NET: {
                this.providedWeb3.isMainNet = action.isMainNet
                this.providedWeb3.netDescription = action.description
                this.emitChange()
                break
            }
            case ActionNames.WALLET_UPDATE_PROVIDED_WEB3_ACCOUNT_AVAILABLE: {
                this.providedWeb3.accountAvailable = action.isAvailable
                this.emitChange()
                break
            }
            case ActionNames.WEB3_UPDATE_IS_CONNECTED: {
                this.providedWeb3.connected = action.connected
                this.emitChange()
                break
            }            
            case ActionNames.WALLET_LEDGER_ACCOUNTS_REQUESTED: {
                this.ledger.accounts = []
                this.ledger.errorName = null
                this.ledger.errorMessage = null
                this.ledger.addressOffset = null
                this.emitChange()
                break
            }
            case ActionNames.WALLET_LEDGER_ERROR: {
                this.ledger.errorMessage = action.errorMessage
                this.ledger.errorName = action.errorName
                this.ledger.accounts = []
                this.emitChange()
                break
            }
            case ActionNames.WALLET_LEDGER_ACCOUNTS_RETRIEVED: {
                this.ledger.accounts = action.accounts
                this.ledger.addressPage = action.page
                this.emitChange()
                break
            }
            case ActionNames.WALLET_LEDGER_DERIVATION_PATH_SOURCE_SELECTED: {
                this.ledger.selectedDerivationPathSource = action.derivationPathSource
                this.ledger.accounts = []
                this.ledger.errorMessage = null
                this.ledger.errorName = null
                this.ledger.addressOffset = null
                this.ledger.addressPage = 0
                this.emitChange()
                break
            }
            case ActionNames.WALLET_LEDGER_CHANGE_ADDRESS_PAGE: {
                this.ledger.addressPage = action.page
                this.emitChange()
                break
            }
            case ActionNames.WALLET_LEDGER_CHANGE_ADDRESS_OFFSET: {
                this.ledger.addressOffset = action.offset
                this.emitChange()
                break
            }
            case ActionNames.WALLET_LEDGER_CHANGE_CUSTOM_DERIVATION_PATH: {
                this.ledger.customDerivationPath = action.derivationPath
                this.ledger.selectedDerivationPathSource = "custom"
                this.emitChange()
                break
            }
            case ActionNames.METAMASK_NETWORK_WARNING_SENT: {
                this.metamastNetworkWarningSentMessageId = action.messageId
                this.emitChange()
                break
            }

        }
    }
}

const walletStore = new WalletStore()
dispatcher.register(walletStore.handleActions.bind(walletStore))

export default walletStore