import React, { Component } from 'react'
import * as WalletActions from "../actions/WalletActions"
import WalletStore from "../stores/WalletStore"
import KeyStoreFile from "./WalletChooser/KeyStore"
import AccountType from "../AccountType"
import PrivateKey from "./WalletChooser/PrivateKey"
import MetaMask from "./WalletChooser/MetaMask"
import Ledger from "./WalletChooser/Ledger"
import { Box, BoxSection } from "./CustomComponents/Box"
import PasswordSection from "./WalletChooser/PrivateKey/PrivateKeyForm/PasswordSection"
import EtherDeltaWeb3 from '../EtherDeltaWeb3'
import Conditional from "./CustomComponents/Conditional"
import Download from "./CustomComponents/Download"
import {withRouter} from "react-router-dom"
import * as AccountApi from "../apis/AccountApi"
import * as Encryption from "../util/Encryption"
import * as WalletDao from "../util/WalletDao"

class WalletCreator extends Component {
    constructor(props) {
        super(props)
        this.state = {
            password: "",
            confirmPassword: "",
            passwordError: null,
            confirmPasswordError: null,
            minPasswordLength: 8,
            newAccount: null,
            newAccountKeyStore: null,
            newAccountKeyStoreFileName: null,
            newAccountShowPrivateKey: false
        }
        this.onWalletStoreChange = this.onWalletStoreChange.bind(this)
    }

    componentWillMount() {
        WalletStore.on("change", this.onWalletStoreChange)
    }

    componentWillUnmount() {
        WalletActions.resetNewAccountWorkflow()
        WalletStore.removeListener("change", this.onWalletStoreChange)
    }

    onWalletStoreChange() {
        this.setState({
            password: WalletStore.getPrivateKeyPassword(),
            confirmPassword: WalletStore.getConfirmPrivateKeyPassword(),
            passwordError: WalletStore.getPrivateKeyPasswordError(),
            confirmPasswordError: WalletStore.getConfirmPrivateKeyPasswordError(),
            useEncryption: WalletStore.getUsePrivateKeyEncryption(),
            newAccount: WalletStore.getNewAccount(),
            newAccountKeyStore: WalletStore.getNewAccountKeyStore(),
            newAccountKeyStoreFileName: WalletStore.getNewAccountKeyStoreFileName(),
            newAccountShowPrivateKey: WalletStore.getNewAccountShowPrivateKey()
        })
    }

    handlePrivateKeyPasswordChange = (event) => {
        this.handlePasswordsChange(event.target.value, this.state.confirmPassword)
    }

    handleConfirmPrivateKeyPasswordChange = (event) => {
        this.handlePasswordsChange(this.state.password, event.target.value)
    }

    handlePasswordsChange(password, confirmPassword) {
        const passwordError = password.length > 0 && password.length < this.state.minPasswordLength
        const confirmPasswordError = confirmPassword.length > 0 && password !== confirmPassword

        WalletActions.changePrivateKeyPasswords(password, confirmPassword, passwordError, confirmPasswordError)
    }

    getCreateWalletDisabled() {
        const { password, confirmPassword, minPasswordLength } = this.state
        const bothPasswordsValid = password.length >= minPasswordLength && password === confirmPassword
        return bothPasswordsValid ? "" : "disabled"
    }

    createNewWallet = (event) => {
        event.preventDefault()
        const { password } = this.state
        const account = EtherDeltaWeb3.createNewAccount()
        const keyStore = EtherDeltaWeb3.encryptToKeyStore(account.privateKey, password)
        const keyStoreFileName = `UTC--${new Date().toISOString().replace(':', '-')}--${keyStore.id}`
        WalletActions.accountCreated(account, keyStore, keyStoreFileName)

        EtherDeltaWeb3.initForPrivateKey(account.address, account.privateKey)
        AccountApi.refreshAccountThenEthAndTokBalance(AccountType.PRIVATE_KEY)
        const encryptedPrivateKey = Encryption.encrypt(account.privateKey, password)
        WalletDao.savePrimaryKeyWallet(encryptedPrivateKey, true)
    }

    showPrivateKey = (event) => {
        event.preventDefault()
        WalletActions.newAccountShowPrivateKeyUpdated(true)
    }

    goToExchange = (event) => {
        event.preventDefault()
        this.props.history.push("/")
    }

    render() {
        const {
            password,
            confirmPassword,
            passwordError,
            confirmPasswordError,
            newAccount,
            newAccountKeyStore,
            newAccountKeyStoreFileName,
            newAccountShowPrivateKey
        } = this.state

        const createWalletDisabled = this.getCreateWalletDisabled()
        const privateKey = newAccount == null ? "" : newAccount.privateKey
        return (
            <Box title="Create New Wallet">
                <Conditional displayCondition={newAccount == null}>
                    <BoxSection>
                        <h3>Enter a Strong Password</h3>
                        <br />
                        <div className="row">
                            <div className="col-lg-12">
                                <form onSubmit={this.createNewWallet}>
                                    <h5>Save this password! If lost it cannot be recovered or reset. GammaDex does not store your password and cannot recover or reset it.</h5>
                                    <br />
                                    <PasswordSection
                                        password={password}
                                        confirmPassword={confirmPassword}
                                        passwordError={passwordError}
                                        confirmPasswordError={confirmPasswordError}
                                        onPasswordChange={this.handlePrivateKeyPasswordChange}
                                        onConfirmPasswordChange={this.handleConfirmPrivateKeyPasswordChange} />
                                    <div className="form-group">
                                        <input className={"btn btn-primary " + createWalletDisabled} type="submit" value="Create New Wallet" />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </BoxSection>
                </Conditional>

                <Conditional displayCondition={newAccount != null && !newAccountShowPrivateKey}>
                    <BoxSection>
                        <h3>Save Your Keystore File</h3>
                        <br />
                        <div className="row">
                            <div className="col-lg-12">
                                <form onSubmit={this.showPrivateKey}>
                                    <Download fileName={newAccountKeyStoreFileName} contents={JSON.stringify(newAccountKeyStore)} mimeType="application/json"
                                        className={"btn btn-primary mr-2"}>Download Keystore File (UTC / JSON)</Download>
                                    <br />
                                    <br />
                                    <h5>**Do not lose it!** It cannot be recovered if you lose it.</h5>
                                    <h5>**Do not share it!** Your funds will be stolen if you use this file on a malicious/phishing site.</h5>
                                    <h5>**Make a backup!**</h5>
                                    <br />
                                    <div className="form-group">
                                        <input className="btn btn-primary" type="submit" value="Understood. Get My Private Key" />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </BoxSection>
                </Conditional>

                <Conditional displayCondition={newAccount != null && newAccountShowPrivateKey}>
                    <BoxSection>
                        <h3>Save Your Private Key</h3>
                        <br />
                        <div className="row">
                            <div className="col-lg-12">
                                <form onSubmit={this.goToExchange}>
                                    <pre>{privateKey}</pre>
                                    <br />
                                    <br />
                                    <h5>**Do not lose it!** It cannot be recovered if you lose it.</h5>
                                    <h5>**Do not share it!** Your funds will be stolen if you use this file on a malicious/phishing site.</h5>
                                    <h5>**Make a backup!**</h5>
                                    <br />
                                    <div className="form-group">
                                        <input className="btn btn-primary" type="submit" value="Understood. Go to Exchange" />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </BoxSection>
                </Conditional>
            </Box>
        )
    }
}

export default withRouter(WalletCreator)
