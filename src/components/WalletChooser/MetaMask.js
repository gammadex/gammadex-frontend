import React from "react"
import WalletStore from "../../stores/WalletStore"
import EtherDeltaWeb3 from "../../EtherDeltaWeb3"
import * as AccountActions from "../../actions/AccountActions"
import AccountType from "../../AccountType"
import * as WalletDao from "../../util/WalletDao"

export default class MetaMask extends React.Component {
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

    selectMetaMask = () => {
        EtherDeltaWeb3.initForMetaMask()
        AccountActions.refreshAccount(AccountType.METAMASK)
        WalletDao.forgetStoredWallet()
    }

    render() {
        const {completedAccount} = this.state

        if (completedAccount) {
            return this.getUnlockedMessage()
        } else {
            return this.getMetaMaskForm()
        }
    }

    getUnlockedMessage() {
        return <div>
            <div className="alert alert-success">
                You are now logged in with metamask
            </div>
        </div>
    }

    getMetaMaskForm() {
        const errorMessage = this.getErrorBlock()

        return <div>
            <h4>Use Metamask Wallet</h4>
            <div className="form-group">
                <a href="#" className="btn btn-primary" onClick={this.selectMetaMask}>Unlock</a>
            </div>

            {errorMessage}
        </div>
    }

    getErrorBlock() {
        const {refreshError} = this.state

        if (refreshError) {
            return <div className="form-group">
                <div className="alert alert-danger">
                    Sorry, there was a problem. Are you logged in to MetaMask?
                </div>
            </div>
        } else {
            return <div>&nbsp;</div>
        }
    }
}