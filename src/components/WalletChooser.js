import React, {Component} from 'react'
import * as WalletActions from "../actions/WalletActions"
import WalletStore from "../stores/WalletStore"
import AccountType from "../AccountType"
import Ledger from "./WalletChooser/Ledger"
import {Box, BoxSection} from "./CustomComponents/Box"
import Conditional from "./CustomComponents/Conditional"
import * as EthereumNetworks from "../util/EthereumNetworks"
import {toDataUrl} from '../lib/blockies.js'
import {truncate} from "../util/FormatUtil"
import KeyStoreForm from "./WalletChooser/KeyStore/KeyStoreForm"
import PrivateKeyForm from "./WalletChooser/PrivateKey/PrivateKeyForm"
import {userPermissionForAccounts} from "../apis/WalletApi"

import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import * as WalletDao from "../util/WalletDao"
import * as AccountApi from "../apis/AccountApi"

import {withRouter} from "react-router-dom"

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
        userPermissionForAccounts()
            .then(() => {
                WalletActions.selectWallet(type)

                if (type === AccountType.METAMASK) {
                    const {providedWeb3} = this.state
                    const {accountAvailable} = providedWeb3

                    if (accountAvailable) {
                        EtherDeltaWeb3.initForMetaMask()
                        WalletDao.saveMetamaskWallet()
                        AccountApi.refreshAccountThenEthAndTokBalance(AccountType.METAMASK, this.props.history)
                    }
                }
            })
            .catch(() => {
                console.error("Unlock MetaMask from the toolbar icon")
            })
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
        const {selectedAccountType, providedWeb3} = this.state

        let panel = this.getPanelContents()

        let metaMaskDisabled = true
        let metaMaskInfo = null
        if (providedWeb3 != null) {
            if (providedWeb3.isMainNet == null) {
                metaMaskInfo = <span className="text-muted">MetaMask not available</span>
            } else if (providedWeb3.isMainNet === false) {
                metaMaskInfo = <span className="text-danger">Please connect to {EthereumNetworks.getMainNetDescription()}</span>
                metaMaskDisabled = false
            } else if (!providedWeb3.accountAvailable) {
                metaMaskInfo = <span className="text-danger">Please unlock MetaMask</span>
                metaMaskDisabled = false
            } else if (providedWeb3.accountAddress) {
                metaMaskInfo = <span className="text-muted"><img width="14" height="14" src={toDataUrl(providedWeb3.accountAddress)}/>&nbsp;{truncate(providedWeb3.accountAddress, {left: 7, right: 5})}</span>
                metaMaskDisabled = false
            }
        }

        return (
            <Box>
                <Conditional displayCondition={selectedAccountType == null}>
                    <BoxSection>
                        <div className="card-header">
                            <div className="card-title">Choose a wallet type to unlock</div>
                        </div>

                        <div className="wallet-buttons">
                            <div className="wallet-button-row">
                                <button disabled={metaMaskDisabled} onClick={this.walletChanged.bind(this, AccountType.METAMASK)} className="btn btn-secondary btn-wallet-type">
                                    <img src={require("../images/wallets/metamask_less_detail.svg")} className="img-wallet-type"/><br/>
                                    <h5>MetaMask</h5>
                                    {metaMaskInfo}
                                </button>

                                <button onClick={this.walletChanged.bind(this, AccountType.LEDGER)} className="btn btn-secondary btn-wallet-type">
                                    <img src={require("../images/wallets/ledger.svg")} className="img-wallet-type"/><br/>
                                    <h5>Ledger Hardware Wallet</h5>
                                </button>
                            </div>
                            <div className="wallet-button-row">
                                <button onClick={this.walletChanged.bind(this, AccountType.KEY_STORE_FILE)} className="btn btn-secondary btn-wallet-type">
                                    <img src={require("../images/wallets/file.svg")} className="img-wallet-type"/><br/>
                                    <h5>JSON Keystore File</h5>
                                </button>

                                <button onClick={this.walletChanged.bind(this, AccountType.PRIVATE_KEY)} className="btn btn-secondary btn-wallet-type">
                                    <img src={require("../images/wallets/key.svg")} className="img-wallet-type"/><br/>
                                    <h5>Private Key</h5>
                                </button>
                            </div>
                        </div>

                    </BoxSection>
                </Conditional>

                <Conditional displayCondition={selectedAccountType != null}>
                    <BoxSection>
                        <div className="card-header with-button">
                            <div className="card-title">Unlock Wallet using {this.accountTypeString(selectedAccountType)}</div>
                            <div>
                                <button className="btn btn-primary" onClick={this.onBack}>Unlock a different wallet</button>
                            </div>
                        </div>
                        <br/>
                        <div className="col-lg-10">
                            {panel}
                        </div>
                    </BoxSection>
                </Conditional>
            </Box>
        )
    }

    getPanelContents() {
        const {selectedAccountType} = this.state

        let panel
        if (!selectedAccountType) {
            panel = <div>&nbsp;</div>
        } else if (selectedAccountType === AccountType.KEY_STORE_FILE) {
            panel = <KeyStoreForm/>
        } else if (selectedAccountType === AccountType.PRIVATE_KEY) {
            panel = <PrivateKeyForm/>
        } else if (selectedAccountType === AccountType.LEDGER) {
            panel = <Ledger/>
        }

        return panel
    }
}

export default withRouter(WalletChooser)
