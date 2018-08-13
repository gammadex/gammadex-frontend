import React, { Component } from 'react'
import * as WalletActions from "../actions/WalletActions"
import WalletStore from "../stores/WalletStore"
import AccountType from "../AccountType"
import { Box, BoxSection } from "./CustomComponents/Box"
import PasswordSection from "./WalletChooser/PrivateKey/PrivateKeyForm/PasswordSection"
import EtherDeltaWeb3 from '../EtherDeltaWeb3'
import Conditional from "./CustomComponents/Conditional"
import Download from "./CustomComponents/Download"
import { withRouter } from "react-router-dom"
import * as AccountApi from "../apis/AccountApi"
import * as Encryption from "../util/Encryption"
import * as WalletDao from "../util/WalletDao"
import { toDataUrl } from '../lib/blockies.js'
import { removeHexPrefix } from "../util/KeyUtil"

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
        const account = EtherDeltaWeb3.createNewAccount()
        WalletActions.accountCreated(account)
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
        return bothPasswordsValid
    }

    createNewWallet = (event) => {
        event.preventDefault()
        const { password, newAccount } = this.state
        const noHexPrivateKey = removeHexPrefix(newAccount.privateKey)
        const keyStore = EtherDeltaWeb3.encryptToKeyStore(noHexPrivateKey, password)
        const keyStoreFileName = `UTC--${new Date().toISOString().replace(':', '-')}--${keyStore.id}`
        WalletActions.keyStoreCreated(keyStore, keyStoreFileName)

        EtherDeltaWeb3.initForPrivateKey(newAccount.address, noHexPrivateKey)
        AccountApi.refreshAccountThenEthAndTokBalance(AccountType.PRIVATE_KEY)
        const encryptedPrivateKey = Encryption.encrypt(noHexPrivateKey, password)
        WalletDao.savePrimaryKeyWallet(newAccount.address, encryptedPrivateKey, true)
    }

    showPrivateKey = (event) => {
        event.preventDefault()
        WalletActions.newAccountShowPrivateKeyUpdated(true)
    }

    goToExchange = (event) => {
        event.preventDefault()
        WalletActions.resetNewAccountWorkflow()
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
        const createWalletDisabledClass = createWalletDisabled ? "" : "disabled"
        const privateKey = newAccount == null ? "" : removeHexPrefix(newAccount.privateKey)
        const address = newAccount == null ? "" : newAccount.address
        const walletImg = !address || address === "" ? null : <img width="20" height="20" src={toDataUrl(address)}/>

        return (
            <Box title={newAccount == null ? "Creating New Wallet..." : "New Wallet Created"}>

                <Conditional displayCondition={newAccount != null && newAccountKeyStore == null}>
                    <BoxSection>
                        <h3>{walletImg}&nbsp;{address}</h3>
                        <br/>
                        <br/>
                        <h5><span className="fas fa-exclamation-circle text-muted"/>&nbsp;Enter a Strong Password</h5>
                        <br />
                        <div className="row">
                            <div className="col-lg-12">
                                <form onSubmit={this.createNewWallet}>
                                    <h5><span className="fas fa-exclamation-circle text-muted"/>&nbsp;Save this password. If lost it cannot be recovered or reset. GammaDex does not store your password and cannot recover or reset it.</h5>
                                    <br />
                                    <small class="form-text text-muted">
                            Your selected wallet details will be stored in your browser's local storage. Your Private Key and JSON Keystore File will be <strong>encrypted</strong> using a password of your choice. You will be prompted for this password each time you visit GammaDEX. No sensitive wallet data is transmitted to or stored on GammaDEX servers, encrypted or otherwise.
                        </small>                                    
                                    <PasswordSection
                                        privateKeyAddress={address}
                                        password={password}
                                        confirmPassword={confirmPassword}
                                        passwordError={passwordError}
                                        confirmPasswordError={confirmPasswordError}
                                        onPasswordChange={this.handlePrivateKeyPasswordChange}
                                        onConfirmPasswordChange={this.handleConfirmPrivateKeyPasswordChange} />
                                    <div className="form-group">
                                        <input className={"btn btn-primary " + createWalletDisabledClass} disabled={!createWalletDisabled} type="submit" value="Encrypt Wallet" />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </BoxSection>
                </Conditional>

                <Conditional displayCondition={newAccountKeyStore != null && !newAccountShowPrivateKey}>
                    <BoxSection>
                        <h3>{walletImg}&nbsp;{address}</h3>
                        <h3>Save Your Keystore File</h3>
                        <br />
                        <div className="row">
                            <div className="col-lg-12">
                                <form onSubmit={this.showPrivateKey}>
                                    <Download fileName={newAccountKeyStoreFileName} contents={JSON.stringify(newAccountKeyStore)} mimeType="application/json"
                                        className={"btn btn-primary mr-2"}>Download Keystore File (UTC / JSON)</Download>
                                    <br />
                                    <br />
                                    <h5><span className="fas fa-exclamation-circle text-muted"/>&nbsp;DO NOT lose this file. It cannot be recovered if you lose it.</h5>
                                    <h5><span className="fas fa-exclamation-circle text-muted"/>&nbsp;DO NOT share it. Your funds will be stolen if you use this file on a malicious/phishing site.</h5>
                                    <h5><span className="fas fa-exclamation-circle text-muted"/>&nbsp;DO make a backup.</h5>
                                    <h5><span className="fas fa-exclamation-circle text-muted"/>&nbsp;DO consider using a Hardware Wallet or MetaMask instead.</h5>
                                    <br />
                                    <div className="form-group">
                                        <input className="btn btn-primary" type="submit" value="Understood. Get My Private Key" />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </BoxSection>
                </Conditional>

                <Conditional displayCondition={newAccountKeyStore != null && newAccountShowPrivateKey}>
                    <BoxSection>
                        <h3>Save Your Private Key</h3>
                        <br />
                        <div className="row">
                            <div className="col-lg-12">
                                <form onSubmit={this.goToExchange}>
                                    <pre><h3 className="text-success">{privateKey}</h3></pre>
                                    <br />
                                    <br />
                                    <h5><span className="fas fa-exclamation-circle text-muted"/>&nbsp;DO NOT lose your Private Key. It cannot be recovered if you lose it.</h5>
                                    <h5><span className="fas fa-exclamation-circle text-muted"/>&nbsp;DO NOT share it. Your funds will be stolen if you enter your Private Key on a malicious/phishing site.</h5>
                                    <h5><span className="fas fa-exclamation-circle text-muted"/>&nbsp;DO Make a backup.</h5>
                                    <h5><span className="fas fa-exclamation-circle text-muted"/>&nbsp;DO consider using a Hardware Wallet or MetaMask instead.</h5>
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
