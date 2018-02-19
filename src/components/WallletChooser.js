import React, {Component} from 'react'
import {WalletType} from "../Wallet"
import * as WalletActions from "../actions/WalletActions"
import WalletStore from "../stores/WalletStore"
import * as EthJsUtil from "ethereumjs-util"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import * as AccountActions from "../actions/AccountActions"

class WallletChooser extends Component {
    state = {
        selectedWalletType: null,
        enteredPrivateKey: "",
        cleanPrivateKey: "",
        isValidPrivateKey: false,
        privateKeyAddress: ""
    }

    componentWillMount() {
        WalletStore.on("change", this.onWalletStoreChange)
    }

    componentWillUnmount() {
        window.removeEventListener("change", this.onWalletStoreChange)
    }

    onWalletStoreChange = () => {
        this.setState((prevState, props) => ({
            selectedWalletType: WalletStore.getWalletType()
        }))
    }

    walletChanged = (event) => {
        WalletActions.selectWallet(event.target.value)
    }

    selectPrivateKey = () => {
        const {isValidPrivateKey, cleanPrivateKey, privateKeyAddress} = this.state

        if (isValidPrivateKey) {
            EtherDeltaWeb3.initForPrivateKey(privateKeyAddress, cleanPrivateKey)
            AccountActions.accountTypeResolved(EtherDeltaWeb3.getIsMetaMask())
            EtherDeltaWeb3.refreshAccount()
                .then(account => AccountActions.accountRetrieved(account))
                .catch(error => console.log(`failed to refresh user account: ${error.message}`))
        }
    }

    selectMetaMask = () => {
        EtherDeltaWeb3.initForMetaMask()
        AccountActions.accountTypeResolved(EtherDeltaWeb3.getIsMetaMask())
        EtherDeltaWeb3.refreshAccount()
            .then(account => AccountActions.accountRetrieved(account))
            .catch(error => console.log(`failed to refresh user account: ${error.message}`))
    }

    selectLedger = () => {
        EtherDeltaWeb3.initForLedger()
        AccountActions.accountTypeResolved(EtherDeltaWeb3.getIsMetaMask())
        EtherDeltaWeb3.refreshAccount()
            .then(account => AccountActions.accountRetrieved(account))
            .catch(error => console.log(`failed to refresh user account: ${error.message}`))
    }

    privateKeyChanged = (event) => {
        const enteredPrivateKey = event.target.value
        const cleanPrivateKey = EthJsUtil.addHexPrefix(enteredPrivateKey)
        const privateKeyBuffer = EthJsUtil.toBuffer(cleanPrivateKey)
        const isValidPrivateKey = EthJsUtil.isValidPrivate(privateKeyBuffer)
        const address = (isValidPrivateKey) ? EthJsUtil.bufferToHex(EthJsUtil.privateToAddress(privateKeyBuffer)) : "";

        if (event && event.target) {
            this.setState((prevState, props) => ({
                enteredPrivateKey,
                cleanPrivateKey,
                isValidPrivateKey,
                privateKeyAddress: address
            }))
        }
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

                    {panel}
                </div>
            </div>
        )
    }

    getPanelContents() {
        const {selectedWalletType, isValidPrivateKey, enteredPrivateKey, privateKeyAddress} = this.state

        const privateKeyClassName = this.getPrivateKeyClassName(enteredPrivateKey, isValidPrivateKey)
        const privateKeySubmitDisabledClass = isValidPrivateKey ? "" : "disabled"

        let panel
        if (!selectedWalletType) {
            panel = <div className="col-lg-10">&nbsp;</div>
        } else if (selectedWalletType === WalletType.KEY_FILE) {
            panel = <div className="col-lg-10">
                <h4>Use Wallet File</h4>

                <div className="form-group">
                    Select Wallet File
                    <input className="btn btn-primary" type="file"/>
                </div>
            </div>
        } else if (selectedWalletType === WalletType.PRIVATE_KEY) {
            panel = <div className="col-lg-10">
                <h4>Use Private Key</h4>
                <form>
                    <div className="form-group">
                        <textarea className={"form-control " + privateKeyClassName} onChange={this.privateKeyChanged}
                                  value={enteredPrivateKey}/>
                    </div>
                    <a href="#" className={"btn btn-primary " + privateKeySubmitDisabledClass}
                       onClick={this.selectPrivateKey}>Unlock</a>
                </form>
            </div>
        } else if (selectedWalletType === WalletType.METAMASK) {
            panel = <div className="col-lg-10">
                <h4>Use Metamask Wallet</h4>
                <form>
                    <a href="#" className="btn btn-primary" onClick={this.selectMetaMask}>Unlock</a>
                </form>
            </div>
        } else if (selectedWalletType === WalletType.LEDGER) {
            panel = <div className="col-lg-10">
                <h4>Use Ledger Wallet</h4>
                <form>
                    <a href="#" className="btn btn-primary" onClick={this.selectLedger}>Unlock</a>
                </form>
            </div>
        }
        return panel
    }

    getPrivateKeyClassName(enteredPrivateKey, isValidPrivateKey) {
        const displayPrivateKeyWarning = (enteredPrivateKey && !isValidPrivateKey)

        if (displayPrivateKeyWarning) {
            return "form-control-warning"
        } else if (isValidPrivateKey) {
            return "form-control-success"
        } else {
            return ""
        }
    }
}

export default WallletChooser
