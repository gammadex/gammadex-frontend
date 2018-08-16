import React from "react"
import WalletStore from "../../../stores/WalletStore"
import EtherDeltaWeb3 from "../../../EtherDeltaWeb3"
import * as AccountActions from "../../../actions/AccountActions"
import * as KeyUtil from "../../../util/KeyUtil"
import * as Encryption from "../../../util/Encryption"
import AccountType from "../../../AccountType"
import * as WalletActions from "../../../actions/WalletActions"
import * as WalletDao from "../../../util/WalletDao"
import EncryptionSection from "./PrivateKeyForm/EncryptionSection"
import Conditional from "../../CustomComponents/Conditional"
import { withRouter } from "react-router-dom"
import * as AccountApi from "../../../apis/AccountApi"
import SafetyWarning from "../SafetyWarning"

class PrivateKeyForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isValidKey: false,
            rememberKey: true,
            enteredPrivateKey: "",
            privateKey: "",
            privateKeyAddress: null,
            password: "",
            confirmPassword: "",
            passwordError: null,
            confirmPasswordError: null,
            useEncryption: true,
            minPasswordLength: 8,
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
            rememberKey: WalletStore.isRememberPrivateKey(),
            password: WalletStore.getPrivateKeyPassword(),
            confirmPassword: WalletStore.getConfirmPrivateKeyPassword(),
            passwordError: WalletStore.getPrivateKeyPasswordError(),
            confirmPasswordError: WalletStore.getConfirmPrivateKeyPasswordError(),
            useEncryption: WalletStore.getUsePrivateKeyEncryption(),
        })
    }

    privateKeyChanged = (event) => {
        const enteredPrivateKey = event.target.value
        const { address, isValid, noHexPrefixKey } = KeyUtil.convertPrivateKeyToAddress(enteredPrivateKey)

        if (event && event.target) {
            this.setState({
                enteredPrivateKey,
                privateKey: noHexPrefixKey,
                isValidKey: isValid,
                privateKeyAddress: address
            })
        }
    }

    selectPrivateKey = (event) => {
        event.preventDefault()

        const { isValidKey, privateKey, privateKeyAddress, password } = this.state

        if (isValidKey) {
            EtherDeltaWeb3.initForPrivateKey(privateKeyAddress, privateKey)
            AccountApi.refreshAccountThenEthAndTokBalance(AccountType.PRIVATE_KEY, this.props.history)

            if (this.state.rememberKey) {
                if (this.state.useEncryption) {
                    const encryptedPrivateKey = Encryption.encrypt(privateKey, password)
                    WalletDao.savePrimaryKeyWallet(privateKeyAddress, encryptedPrivateKey, true)
                } else {
                    WalletDao.savePrimaryKeyWallet(privateKeyAddress, privateKey, false)
                }
            } else {
                WalletDao.forgetStoredWallet()
            }

            this.props.history.push("/")
        }
    }

    handleRemember = (event) => {
        WalletActions.changedPrivateKeyRememberMe(event.target.checked)
    }

    handleUseEncryption = (event) => {
        WalletActions.changeUsePrivateKeyEncryption(event.target.checked)
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

    render() {
        const {
            isValidKey,
            enteredPrivateKey,
            rememberKey,
            useEncryption,
            password,
            confirmPassword,
            passwordError,
            confirmPasswordError,
            privateKeyAddress
        } = this.state

        const privateKeyClassName = this.getKeyInputClassName(enteredPrivateKey, isValidKey)

        const privateKeySubmitDisabledClass = this.getSubmitButtonClassName(isValidKey, rememberKey, useEncryption)

        return <div>
            <SafetyWarning />
            <h4>Paste Your Private Key</h4>
            <form onSubmit={this.selectPrivateKey}>
                <div className="form-group">
                    <textarea className={"form-control " + privateKeyClassName}
                        onChange={this.privateKeyChanged}
                        value={enteredPrivateKey} />
                </div>

                <div className="form-group">
                    <div className="custom-control custom-checkbox my-1 mr-sm-2">
                        <input type="checkbox"
                            className="custom-control-input"
                            id="rememberKey"
                            onChange={this.handleRemember}
                            value="true"
                            checked={rememberKey}
                        />
                        <label className="custom-control-label" htmlFor="rememberKey">Remember for next visit</label>
                        <small class="form-text text-muted">
                            Your selected wallet details will be stored in your browser's local storage. Your Private Key will be <strong>encrypted</strong> using a separate password of your choice. You will be prompted for this password each time you visit GammaDEX.
                        </small>
                    </div>
                </div>

                <Conditional displayCondition={rememberKey}>
                    <EncryptionSection
                        privateKeyAddress={privateKeyAddress}
                        useEncryption={useEncryption}
                        password={password}
                        confirmPassword={confirmPassword}
                        passwordError={passwordError}
                        confirmPasswordError={confirmPasswordError}
                        onPasswordChange={this.handlePrivateKeyPasswordChange}
                        onConfirmPasswordChange={this.handleConfirmPrivateKeyPasswordChange}
                        onUseEncryptionChange={this.handleUseEncryption}
                    />
                </Conditional>

                <div className="form-group">
                    <input className={"btn btn-primary " + privateKeySubmitDisabledClass} type="submit" value="Unlock" />
                </div>
            </form>
        </div>
    }

    getSubmitButtonClassName() {
        const { isValidKey, rememberKey, useEncryption, password, confirmPassword, minPasswordLength } = this.state

        const bothPasswordsValid = password.length >= minPasswordLength && password === confirmPassword

        let className = "disabled"
        if (isValidKey) {
            if (!rememberKey || !useEncryption) {
                className = ""
            } else if (bothPasswordsValid) {
                className = ""
            }
        }

        return className
    }

    getKeyInputClassName(enteredPrivateKey, isValidKey) {
        const displayPrivateKeyWarning = enteredPrivateKey && !isValidKey

        if (displayPrivateKeyWarning) {
            return "form-control-warning"
        } else if (isValidKey) {
            return "form-control-success"
        } else {
            return ""
        }
    }
}

export default withRouter(PrivateKeyForm)