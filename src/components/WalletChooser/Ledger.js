import React from "react"
import WalletStore from "../../stores/WalletStore"
import EtherDeltaWeb3 from "../../EtherDeltaWeb3"
import * as AccountActions from "../../actions/AccountActions"
import AccountType from "../../AccountType"

export default class Ledger extends React.Component {
    state = {
        completedAccount: null,
        refreshError: null
    }

    componentDidMount() {
        WalletStore.on("change", this.onWalletStoreChange)
    }

    componentWillUnmount() {
        WalletStore.removeListener("change", this.onWalletStoreChange)
    }

    onWalletStoreChange = () => {
        this.setState((prevState, props) => {
            return {
                completedAccount: WalletStore.getCompletedAccount(),
                refreshError: WalletStore.getRefreshError(),
            }
        })
    }

    selectLedger = () => {
        EtherDeltaWeb3.initForLedger()
        EtherDeltaWeb3.refreshAccount()
            .then(account => AccountActions.accountRetrieved(account, AccountType.LEDGER))
            .catch(error => AccountActions.accountRefreshError(AccountType.LEDGER, error))
    }

    render() {
        const {completedAccount} = this.state

        if (completedAccount) {
            return this.getUnlockedMessage()
        } else {
            return this.getLedgerForm()
        }
    }

    getUnlockedMessage() {
        return <div>
            <div className="alert alert-success">
                You are now logged in with a ledger wallet
            </div>
        </div>
    }

    getLedgerForm() {
        const errorMessage = this.getErrorBlock()

        return <div>
            <h4>Use Ledger Wallet</h4>
            <div className="form-group">
                <a href="#" className="btn btn-primary" onClick={this.selectLedger}>Unlock</a>
            </div>

            {errorMessage}
        </div>
    }

    getErrorBlock() {
        const {refreshError} = this.state

        if (refreshError) {
            return <div className="form-group">
                <div className="alert alert-danger">
                    Sorry, there was a problem. Is your ledger plugged in?
                </div>
            </div>
        } else {
            return <div>&nbsp;</div>
        }
    }
}