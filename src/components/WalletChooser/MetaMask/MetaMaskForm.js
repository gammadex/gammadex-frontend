import React from "react"
import WalletStore from "../../../stores/WalletStore"
import EtherDeltaWeb3 from "../../../EtherDeltaWeb3"
import * as AccountActions from "../../../actions/AccountActions"
import AccountType from "../../../AccountType"
import * as WalletDao from "../../../util/WalletDao"
import Conditional from "../../CustomComponents/Conditional"
import * as EthereumNetworks from "../../../util/EthereumNetworks"
import {withRouter} from "react-router-dom"
import * as AccountApi from "../../../apis/AccountApi"
import * as WalletActions from "../../../actions/WalletActions"

class MetaMaskForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            refreshError: null,
            providedWeb3: {},
            rememberMetamask: false,
        }

        this.onWalletStoreChange = this.onWalletStoreChange.bind(this)
    }

    componentDidMount() {
        WalletStore.on("change", this.onWalletStoreChange)
        this.onWalletStoreChange()
    }

    componentWillUnmount() {
        WalletStore.removeListener("change", this.onWalletStoreChange)
    }

    onWalletStoreChange() {
        this.setState({
            refreshError: WalletStore.getRefreshError(),
            providedWeb3: WalletStore.getProvidedWeb3Info(),
            rememberMetamask: WalletStore.isRememberMetamask(),
        })
    }

    selectMetaMask = () => {
        const {providedWeb3} = this.state
        const {accountAvailable} = providedWeb3

        if (accountAvailable) {
            EtherDeltaWeb3.initForMetaMask()
            if (this.state.rememberMetamask) {
                WalletDao.saveMetamaskWallet()
            } else {
                WalletDao.forgetStoredWallet()
            }
            AccountApi.refreshAccountThenEthAndTokBalance(AccountType.METAMASK, this.props.history)
        }
    }

    handleRemember = (event) => {
        WalletActions.changedMetamaskRememberMe(event.target.checked)
    }

    render() {
        const {refreshError, providedWeb3, rememberMetamask} = this.state
        const {available, isMainNet, netDescription, accountAvailable} = providedWeb3
        const mainNetDescription = EthereumNetworks.getMainNetDescription()

        const submitDisabledClass = (accountAvailable) ? "" : "disabled"

        return <div>
            <h4>Use Metamask Wallet</h4>
            <div className="form-group">
                <button className={"btn btn-primary " + submitDisabledClass}
                        onClick={this.selectMetaMask}>Unlock
                </button>
            </div>

            <div className="form-group">
                <div className="custom-control custom-checkbox my-1 mr-sm-2">
                    <input type="checkbox"
                           className={"custom-control-input " + submitDisabledClass}
                           id="rememberMetamask"
                           onChange={this.handleRemember}
                           value="true"
                           checked={rememberMetamask}
                    />
                    <label className={"custom-control-label " + submitDisabledClass} htmlFor="rememberMetamask">Remember
                        for next time</label>
                </div>
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
                        Sorry, the MetaMask network you are connected to is the {netDescription}, not
                        the {mainNetDescription}.

                        Please connect to the {mainNetDescription}.
                    </div>
                </div>
            </Conditional>

            <Conditional displayCondition={isMainNet && accountAvailable === false}>
                <div className="form-group">
                    <div className="alert alert-danger">
                        Sorry, you are not logged in to MetaMask.

                        Please unlock a wallet to use this site.
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

export default withRouter(MetaMaskForm)