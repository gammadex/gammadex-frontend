import React from "react"
import WalletStore from "../../../stores/WalletStore"
import EtherDeltaWeb3 from "../../../EtherDeltaWeb3"
import * as AccountActions from "../../../actions/AccountActions"
import AccountType from "../../../AccountType"
import * as WalletDao from "../../../util/WalletDao"
import Conditional from "../../Conditional"
import * as EthereumNetworks from "../../../util/EthereumNetworks"

export default class MetaMaskForm extends React.Component {
    state = {
        refreshError: null,
        providedWeb3: {}
    }

    componentWillMount() {
        this.onWalletStoreChange()
    }

    componentDidMount() {
        WalletStore.on("change", this.onWalletStoreChange)
    }

    componentWillUnmount() {
        WalletStore.removeListener("change", this.onWalletStoreChange)
    }

    onWalletStoreChange = () => {
        this.setState({
            refreshError: WalletStore.getRefreshError(),
            providedWeb3: WalletStore.getProvidedWeb3Info(),
        })
    }

    selectMetaMask = () => {
        EtherDeltaWeb3.initForMetaMask()
        WalletDao.forgetStoredWallet()
        AccountActions.refreshAccount(AccountType.METAMASK)
    }

    render() {
        const {refreshError, providedWeb3} = this.state
        const {available, isMainNet, netDescription, accountAvailable} = providedWeb3
        const mainNetDescription = EthereumNetworks.getMainNetDescription()

        const submitDisabledClass = accountAvailable ? "" : "disabled"

        return <div>
            <h4>Use Metamask Wallet</h4>
            <div className="form-group">
                <a href="#" className={"btn btn-primary " + submitDisabledClass}
                   onClick={this.selectMetaMask}>Unlock</a>
            </div>

            <Conditional displayCondition={available === false}>
                <div className="form-group">
                    <div className="alert alert-danger">
                        Sorry, MetaMask doesn't seem to be available in your browser.
                    </div>
                </div>
            </Conditional>

            <Conditional displayCondition={isMainNet === false}>
                <div className="form-group">
                    <div className="alert alert-danger">
                        Sorry, the MetaMask network you are logged into is the {netDescription}, not
                        the {mainNetDescription}.

                        Please log in to the {mainNetDescription}.
                    </div>
                </div>
            </Conditional>

            <Conditional displayCondition={isMainNet && accountAvailable === false}>
                <div className="form-group">
                    <div className="alert alert-danger">
                        Sorry, you are not logged in to MetaMask.

                        Please log in to use this site.
                    </div>
                </div>
            </Conditional>

            <Conditional displayCondition={refreshError}>
                <div className="form-group">
                    <div className="alert alert-danger">
                        Sorry, there was a problem. Are you logged in to the {mainNetDescription} with MetaMask?
                        {refreshError}
                    </div>
                </div>
            </Conditional>
        </div>
    }
}