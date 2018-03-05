import React, {Component} from 'react'
import * as WalletActions from "../actions/WalletActions"
import WalletStore from "../stores/WalletStore"
import KeyStoreFile from "./WalletChooser/KeyStore"
import AccountType from "../AccountType"
import PrivateKey from "./WalletChooser/PrivateKey"
import MetaMask from "./WalletChooser/MetaMask"
import Ledger from "./WalletChooser/Ledger"

class WalletChooser extends Component {
    state = {
        selectedAccountType: null,
        enteredPrivateKey: "",
        privateKey: "",
        isValidPrivateKey: false,
        privateKeyAddress: "",
        enteredKeyStorePassword: ""
    }

    componentWillMount() {
        WalletStore.on("change", this.onWalletStoreChange)
    }

    componentWillUnmount() {
        WalletStore.removeListener("change", this.onWalletStoreChange)
    }

    onWalletStoreChange = () => {
        this.setState((prevState, props) => ({
            selectedAccountType: WalletStore.getSelectedAccountType(),
        }))
    }

    walletChanged = (event) => {
        WalletActions.selectWallet(event.target.value)
    }

    render() {
        const {selectedAccountType} = this.state

        let panel = this.getPanelContents()

        return (
            <div>
                <h2>Wallets</h2>

                <h3>Choose your Wallet</h3>

                <div className="row">
                    <div className="col-lg-2">
                        <fieldset>
                            <div className="form-check">
                                <label>
                                    <input type="radio" className="form-check-input" name="type" value={AccountType.KEY_STORE_FILE}
                                           checked={selectedAccountType === AccountType.KEY_STORE_FILE}
                                           onChange={this.walletChanged}/>

                                    Key File
                                </label>
                            </div>

                            <div className="form-check">
                                <label>
                                    <input type="radio" className="form-check-input" name="type" value={AccountType.PRIVATE_KEY}
                                           checked={selectedAccountType === AccountType.PRIVATE_KEY}
                                           onChange={this.walletChanged}/>

                                    Private Key
                                </label>
                            </div>

                            <div className="form-check">
                                <label>
                                    <input type="radio" className="form-check-input" name="type" value={AccountType.METAMASK}
                                           checked={selectedAccountType === AccountType.METAMASK}
                                           onChange={this.walletChanged}/>

                                    Metamask
                                </label>
                            </div>

                            <div className="form-check">
                                <label>
                                    <input type="radio" className="form-check-input" name="type" value={AccountType.LEDGER}
                                           checked={selectedAccountType === AccountType.LEDGER}
                                           onChange={this.walletChanged}/>

                                    Ledger Wallet
                                </label>
                            </div>
                        </fieldset>
                    </div>

                    <div className="col-lg-10">
                        {panel}
                    </div>
                </div>

            </div>
        )
    }

    getPanelContents() {
        const {selectedAccountType} = this.state

        let panel
        if (!selectedAccountType) {
            panel = <div>&nbsp;</div>
        } else if (selectedAccountType === AccountType.KEY_STORE_FILE) {
            panel = <KeyStoreFile/>
        } else if (selectedAccountType === AccountType.PRIVATE_KEY) {
            panel = <PrivateKey/>
        } else if (selectedAccountType === AccountType.METAMASK) {
            panel = <MetaMask/>
        } else if (selectedAccountType === AccountType.LEDGER) {
            panel = <Ledger/>
        }

        return panel
    }
}

export default WalletChooser
