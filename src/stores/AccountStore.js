import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

class AccountStore extends EventEmitter {
    constructor() {
        super()
        this.account = null
        this.accountRetrieved = false,
        this.walletBalanceEthWei = 0,
        this.walletBalanceTokWei = 0,
        this.exchangeBalanceEthWei = 0,
        this.exchangeBalanceTokWei = 0
    }

    getAccountState() {
        return {
            account: this.account,
            accountRetrieved: this.accountRetrieved,
            walletBalanceEthWei: this.walletBalanceEthWei,
            walletBalanceTokWei: this.walletBalanceTokWei,
            exchangeBalanceEthWei: this.exchangeBalanceEthWei,
            exchangeBalanceTokWei: this.exchangeBalanceTokWei
        }
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.ACCOUNT_RETRIEVED: {
                this.account = action.account
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
        }
    }
}

const accountStore = new AccountStore()
dispatcher.register(accountStore.handleActions.bind(accountStore))

export default accountStore