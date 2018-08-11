import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import { safeBigNumber } from "../EtherConversion"
import BigNumber from 'bignumber.js'
import Config from "../Config"

class AccountStore extends EventEmitter {
    constructor() {
        super()
        this._clearState()
    }

    _clearState() {
        this.selectedAccountType = null
        this.account = null
        this.retrievingAccount = false
        this.accountRetrieved = false
        this.nonce = 0
        this.walletBalanceEthWei = 0
        this.walletBalanceTokWei = 0
        this.exchangeBalanceEthWei = 0
        this.exchangeBalanceTokWei = 0
        this.tradableBalanceEthWei = 0 // exchange balance minus fee
        this.tradableBalanceTokWei = 0
        this.accountSequenceNum = 0 // number of times an account has been set up
        this.balanceRetrieved = false
        this.retrievingBalance = false
        this.balanceRetrievalFailed = false
        this.accountPopoverOpen = false
        this.retrievedTokenAddress = null
    }

    getAccountState() {
        return {
            selectedAccountType: this.selectedAccountType,
            retrievingAccount: this.retrievingAccount,
            account: this.account,
            accountRetrieved: this.accountRetrieved,
            nonce: this.nonce,
            walletBalanceEthWei: this.walletBalanceEthWei,
            walletBalanceTokWei: this.walletBalanceTokWei,
            exchangeBalanceEthWei: this.exchangeBalanceEthWei,
            exchangeBalanceTokWei: this.exchangeBalanceTokWei,
            tradableBalanceEthWei: this.tradableBalanceEthWei,
            tradableBalanceTokWei: this.tradableBalanceTokWei,
            accountSequenceNum: this.accountSequenceNum,
            balanceRetrieved: this.balanceRetrieved,
            retrievingBalance: this.retrievingBalance,
            balanceRetrievalFailed: this.balanceRetrievalFailed,
            accountPopoverOpen: this.accountPopoverOpen,
            retrievedTokenAddress: this.retrievedTokenAddress
        }
    }

    getAccount() {
        return this.account
    }

    getSelectedAccountType() {
        return this.selectedAccountType
    }

    isRetrievingAccount() {
        return this.retrievingAccount
    }

    isAccountRetrieved() {
        return this.accountRetrieved
    }

    isBalanceRetrieved() {
        return this.balanceRetrieved
    }

    isRetrievingBalance() {
        return this.retrievingBalance
    }

    isBalanceRetrievalFailed() {
        return this.balanceRetrievalFailed
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.RETRIEVING_ACCOUNT: {
                this._clearState()
                this.retrievingAccount = true
                this.emitChange()
                break
            }
            case ActionNames.ACCOUNT_RETRIEVED: {
                this.account = action.addressNonce.address
                this.nonce = action.addressNonce.nonce
                this.accountRetrieved = true
                this.retrievingAccount = false
                this.selectedAccountType = action.selectedAccountType
                this.accountSequenceNum += 1
                this.emitChange()
                break
            }
            case ActionNames.RETRIEVING_BALANCE: {
                this.retrievingBalance = true
                this.balanceRetrieved = false
                this.balanceRetrievalFailed = false
                this.emitChange()
                break
            }
            case ActionNames.BALANCE_RETRIEVED: {
                this.walletBalanceEthWei = action.balance[0]
                this.walletBalanceTokWei = action.balance[1]
                this.exchangeBalanceEthWei = action.balance[2]
                this.exchangeBalanceTokWei = action.balance[3]
                const feeEthWei = safeBigNumber(this.exchangeBalanceEthWei).times(BigNumber(Config.getExchangeFeePercent())).dp(0, BigNumber.ROUND_CEIL)
                this.tradableBalanceEthWei = safeBigNumber(this.exchangeBalanceEthWei).minus(feeEthWei)

                const feeTokWei = safeBigNumber(this.exchangeBalanceTokWei).times(BigNumber(Config.getExchangeFeePercent())).dp(0, BigNumber.ROUND_CEIL)
                this.tradableBalanceTokWei = safeBigNumber(this.exchangeBalanceTokWei).minus(feeTokWei)

                this.retrievedTokenAddress = action.tokenAddress
                if (action.notify) {
                    this.balanceRetrieved = true
                    this.retrievingBalance = false
                }
                this.emitChange()
                break
            }
            case ActionNames.BALANCE_RETRIEVAL_FAILED: {
                this.walletBalanceEthWei = 0
                this.walletBalanceTokWei = 0
                this.exchangeBalanceEthWei = 0
                this.exchangeBalanceTokWei = 0
                this.tradableBalanceEthWei = 0
                this.tradableBalanceTokWei = 0
                if (action.notify) {
                    this.retrievingBalance = false
                    this.balanceRetrievalFailed = true
                }
                this.emitChange()
                break
            }
            case ActionNames.NONCE_UPDATED: {
                if (action.nonce > this.nonce) {
                    this.nonce = action.nonce
                    this.emitChange()
                }
                break
            }
            case ActionNames.WALLET_LOGOUT: {
                this._clearState()
                this.emitChange()
                break
            }
            case ActionNames.TOGGLE_ACCOUNT_POPOVER: {
                this.accountPopoverOpen = action.accountPopoverOpen
                this.emitChange()
                break
            }            
        }
    }
}

const accountStore = new AccountStore()
dispatcher.register(accountStore.handleActions.bind(accountStore))

export default accountStore