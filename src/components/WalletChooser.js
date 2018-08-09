import React, { Component } from 'react'
import * as WalletActions from "../actions/WalletActions"
import WalletStore from "../stores/WalletStore"
import KeyStoreFile from "./WalletChooser/KeyStore"
import AccountType from "../AccountType"
import PrivateKey from "./WalletChooser/PrivateKey"
import MetaMask from "./WalletChooser/MetaMask"
import Ledger from "./WalletChooser/Ledger"
import { Box, BoxSection } from "./CustomComponents/Box"
import Conditional from "./CustomComponents/Conditional"
import * as EthereumNetworks from "../util/EthereumNetworks"
import { toDataUrl } from '../lib/blockies.js'
import { truncate } from "../util/FormatUtil"

class WalletChooser extends Component {
    constructor(props) {
        super(props)

        this.state = {
            selectedAccountType: null,
            providedWeb3: null
        }

        this.onWalletStoreChange = this.onWalletStoreChange.bind(this)
    }

    componentWillMount() {
        WalletStore.on("change", this.onWalletStoreChange)
    }

    componentWillUnmount() {
        WalletStore.removeListener("change", this.onWalletStoreChange)
        WalletActions.clearSelectedWalletType()
    }

    onWalletStoreChange() {
        this.setState((prevState, props) => ({
            selectedAccountType: WalletStore.getSelectedAccountType(),
            providedWeb3: WalletStore.getProvidedWeb3Info()
        }))
    }

    walletChanged = (type, event) => {
        WalletActions.selectWallet(type)
    }

    onBack = (event) => {
        WalletActions.clearSelectedWalletType()
    }

    accountTypeString(type) {
        let str = ""
        switch (type) {
            case AccountType.KEY_STORE_FILE:
                str = "Keystore File"
                break
            case AccountType.PRIVATE_KEY:
                str = "Private Key"
                break
            case AccountType.METAMASK:
                str = "MetaMask"
                break
            case AccountType.LEDGER:
                str = "Ledger Wallet"
                break
            default:
        }
        return str
    }

    render() {
        const { selectedAccountType, providedWeb3 } = this.state

        const metaMaskDisabled = providedWeb3 == null || !providedWeb3.isMainNet || !providedWeb3.accountAvailable
        let panel = this.getPanelContents()

        let metaMaskInfo = null
        if (providedWeb3 != null) {
            if (providedWeb3.isMainNet == null) {
                metaMaskInfo = <span className="text-muted">MetaMask not available</span>
            } else if (providedWeb3.isMainNet === false) {
                metaMaskInfo = <span className="text-danger">Please connect to {EthereumNetworks.getMainNetDescription()}</span>
            } else if (!providedWeb3.accountAvailable) {
                metaMaskInfo = <span className="text-danger">Please unlock MetaMask</span>
            } else if (providedWeb3.accountAddress) {
                metaMaskInfo = <span className="text-muted"><img width="14" height="14" src={toDataUrl(providedWeb3.accountAddress)} />&nbsp;{truncate(providedWeb3.accountAddress, { left: 7, right: 5 })}</span>
            }
        }

        return (
            <Box>
                <Conditional displayCondition={selectedAccountType == null}>
                    <BoxSection>
                        <div className="card-header">
                            <div className="card-title">Choose a wallet type to unlock</div>
                        </div>
                        <br />

                        <div className="row">
                            <div className="col-lg-3" />
                            <div className="col-lg-3">
                                <button onClick={this.walletChanged.bind(this, AccountType.KEY_STORE_FILE)} className="btn btn-secondary btn-wallet-type">
                                    <img src={require("../images/wallets/file.svg")} className="img-wallet-type" /><br />
                                    <h5>JSON Keystore File</h5>
                                </button>
                            </div>
                            <div className="col-lg-3">
                                <button onClick={this.walletChanged.bind(this, AccountType.PRIVATE_KEY)} className="btn btn-secondary btn-wallet-type">
                                    <img src={require("../images/wallets/key.svg")} className="img-wallet-type" /><br />
                                    <h5>Private Key</h5>
                                </button>
                            </div>
                            <div className="col-lg-3" />
                        </div>
                        <div className="row mt-3">
                            <div className="col-lg-3" />
                            <div className="col-lg-3">
                                <button disabled={metaMaskDisabled} onClick={this.walletChanged.bind(this, AccountType.METAMASK)} className="btn btn-secondary btn-wallet-type">
                                    <img src={require("../images/wallets/metamask_less_detail.svg")} className="img-wallet-type" /><br />
                                    <h5>MetaMask</h5>
                                    {metaMaskInfo}
                                </button>
                            </div>
                            <div className="col-lg-3">
                                <button onClick={this.walletChanged.bind(this, AccountType.LEDGER)} className="btn btn-secondary btn-wallet-type">
                                    <img src={require("../images/wallets/ledger.svg")} className="img-wallet-type" /><br />
                                    <h5>Ledger Hardware Wallet</h5>
                                </button>
                            </div>
                            <div className="col-lg-3" />

                        </div>

                    </BoxSection>
                </Conditional>

                <Conditional displayCondition={selectedAccountType != null}>
                    <BoxSection>
                        <div className="card-header with-button">
                            <div className="card-title">Unlock {this.accountTypeString(selectedAccountType)}</div>
                            <div>
                                <button className="btn btn-primary" onClick={this.onBack}>Unlock a different wallet</button>
                            </div>
                        </div>
                        <br />
                        <div className="col-lg-10">
                            {panel}
                        </div>
                    </BoxSection>
                </Conditional>
            </Box>
        )
    }

    getPanelContents() {
        const { selectedAccountType } = this.state

        let panel
        if (!selectedAccountType) {
            panel = <div>&nbsp;</div>
        } else if (selectedAccountType === AccountType.KEY_STORE_FILE) {
            panel = <KeyStoreFile />
        } else if (selectedAccountType === AccountType.PRIVATE_KEY) {
            panel = <PrivateKey />
        } else if (selectedAccountType === AccountType.METAMASK) {
            panel = <MetaMask />
        } else if (selectedAccountType === AccountType.LEDGER) {
            panel = <Ledger />
        }

        return panel
    }
}

export default WalletChooser
