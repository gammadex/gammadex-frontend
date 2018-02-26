import React, {Component} from 'react'
import {WalletType} from "../Wallet"
import * as WalletActions from "../actions/WalletActions"
import WalletStore from "../stores/WalletStore"
import * as EthJsUtil from "ethereumjs-util"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import * as AccountActions from "../actions/AccountActions"
import KeyStoreFile from "./WalletChooser/KeyStore"
import * as KeyUtil from "../util/KeyUtil"
import AccountType from "../AccountType"
import PrivateKey from "./WalletChooser/PrivateKey"
import MetaMask from "./WalletChooser/MetaMask"
import Ledger from "./WalletChooser/Ledger"

class WalletChooser extends Component {
    state = {
        selectedWalletType: null,
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
            selectedWalletType: WalletStore.getWalletType(),
        }))
    }

    walletChanged = (event) => {
        WalletActions.selectWallet(event.target.value)
    }

    render() {
        const {selectedWalletType} = this.state

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
                                    <input type="radio" className="form-check-input" name="type" value="KEY_FILE"
                                           checked={selectedWalletType === WalletType.KEY_FILE}
                                           onChange={this.walletChanged}/>

                                    Key File
                                </label>
                            </div>

                            <div className="form-check">
                                <label>
                                    <input type="radio" className="form-check-input" name="type" value="PRIVATE_KEY"
                                           checked={selectedWalletType === WalletType.PRIVATE_KEY}
                                           onChange={this.walletChanged}/>

                                    Private Key
                                </label>
                            </div>

                            <div className="form-check">
                                <label>
                                    <input type="radio" className="form-check-input" name="type" value="METAMASK"
                                           checked={selectedWalletType === WalletType.METAMASK}
                                           onChange={this.walletChanged}/>

                                    Metamask
                                </label>
                            </div>

                            <div className="form-check">
                                <label>
                                    <input type="radio" className="form-check-input" name="type" value="LEDGER"
                                           checked={selectedWalletType === WalletType.LEDGER}
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
        const {selectedWalletType} = this.state

        let panel
        if (!selectedWalletType) {
            panel = <div>&nbsp;</div>
        } else if (selectedWalletType === WalletType.KEY_FILE) {
            panel = <KeyStoreFile/>
        } else if (selectedWalletType === WalletType.PRIVATE_KEY) {
            panel = <PrivateKey/>
        } else if (selectedWalletType === WalletType.METAMASK) {
            panel = <MetaMask/>
        } else if (selectedWalletType === WalletType.LEDGER) {
            panel = <Ledger/>
        }

        return panel
    }
}

export default WalletChooser
