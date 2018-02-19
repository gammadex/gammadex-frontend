import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

class AccountStore extends EventEmitter {
    constructor() {
        super()
        this.isMetaMask = false
        this.account = null
        this.accountRetrieved = false
        this.nonce = 0
        this.walletBalanceEthWei = 0
        this.walletBalanceTokWei = 0
        this.exchangeBalanceEthWei = 0
        this.exchangeBalanceTokWei = 0
        this.ethTransaction = null
        this.tokTransaction = null
        this.modal = false
        this.modalValue = ''
        this.modalIsEth = false
        this.modalIsDeposit = false
    }

    getAccountState() {
        return {
            isMetaMask: this.isMetaMask,
            account: this.account,
            accountRetrieved: this.accountRetrieved,
            nonce: this.nonce,
            walletBalanceEthWei: this.walletBalanceEthWei,
            walletBalanceTokWei: this.walletBalanceTokWei,
            exchangeBalanceEthWei: this.exchangeBalanceEthWei,
            exchangeBalanceTokWei: this.exchangeBalanceTokWei,
            ethTransaction: this.ethTransaction,
            tokTransaction: this.tokTransaction,
            modal: this.modal,
            modalValue: this.modalValue,
            modalIsEth: this.modalIsEth,
            modalIsDeposit: this.modalIsDeposit
        }
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.ACCOUNT_TYPE_RESOLVED: {
                this.isMetaMask = action.accountType
                this.emitChange()
                break
            }
            case ActionNames.ACCOUNT_RETRIEVED: {
                this.account = action.addressNonce.address
                this.nonce = action.addressNonce.nonce
                this.accountRetrieved = true
                this.emitChange()
                break
            }
            case ActionNames.BALANCE_RETRIEVED: {
                this.walletBalanceEthWei = action.balance[0]
                this.walletBalanceTokWei = action.balance[1]
                this.exchangeBalanceEthWei = action.balance[2]
                this.exchangeBalanceTokWei = action.balance[3]
                this.emitChange()
                break
            }
            case ActionNames.BALANCE_RETRIEVAL_FAILED: {
                this.walletBalanceEthWei = 0
                this.walletBalanceTokWei = 0
                this.exchangeBalanceEthWei = 0
                this.exchangeBalanceTokWei = 0
                this.emitChange()
                break
            }
            case ActionNames.DEPOSIT_WITHDRAW: {
                const { isEth, isDeposit } = action.depositWithdrawProps
                this.modal = true
                this.modalValue = ''
                this.modalIsEth = isEth
                this.modalIsDeposit = isDeposit
                this.emitChange()
                break
            }
            case ActionNames.DEPOSIT_WITHDRAW_CANCEL: {
                this.modal = false
                this.emitChange()
                break
            }
            case ActionNames.ETH_TRANSACTION: {
                this.ethTransaction = action.tx
                this.emitChange()
                break
            }
            case ActionNames.TOK_TRANSACTION: {
                this.tokTransaction = action.tx
                this.emitChange()
                break
            }
            case ActionNames.DEPOSIT_WITHDRAW_AMOUNT_UPDATED: {
                this.modalValue = action.amount
                this.emitChange()
                break
            }
            case ActionNames.NONCE_UPDATED: {
                this.nonce = action.nonce
                this.emitChange()
                break
            }
        }
    }
}

const accountStore = new AccountStore()
dispatcher.register(accountStore.handleActions.bind(accountStore))

export default accountStore