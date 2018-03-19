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

export default class PrivateKeyForm extends React.Component {
    state = {
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
        const {address, isValid, noHexPrefixKey} = KeyUtil.convertPrivateKeyToAddress(enteredPrivateKey)

        // TODO - move into WalletStore
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

        const {isValidKey, privateKey, privateKeyAddress, password} = this.state

        if (isValidKey) {
            EtherDeltaWeb3.initForPrivateKey(privateKeyAddress, privateKey)
            AccountActions.refreshAccount(AccountType.PRIVATE_KEY)

            if (this.state.rememberKey) {
                if (this.state.useEncryption) {
                    const encryptedPrivateKey = Encryption.encrypt(privateKey, password)
                    WalletDao.savePrimaryKeyWallet(encryptedPrivateKey, true)
                } else {
                    WalletDao.savePrimaryKeyWallet(privateKey, false)
                }
            } else {
                WalletDao.forgetStoredWallet()
            }
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
        } = this.state

        const privateKeyClassName = this.getKeyInputClassName(enteredPrivateKey, isValidKey)

        const privateKeySubmitDisabledClass = this.getSubmitButtonClassName(isValidKey, rememberKey, useEncryption)

        return <div>
            <h4>Use Private Key</h4>
            <form onSubmit={this.selectPrivateKey}>
                <div className="form-group">
                        <textarea className={"form-control " + privateKeyClassName}
                                  onChange={this.privateKeyChanged}
                                  value={enteredPrivateKey}/>
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
                        <label className="custom-control-label" htmlFor="rememberKey">Remember for next time</label>
                    </div>
                </div>

                <Conditional displayCondition={rememberKey}>
                    <EncryptionSection
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
                    <input className={"btn btn-primary " + privateKeySubmitDisabledClass} type="submit"  value="Unlock" />
                </div>
            </form>
        </div>
    }

    getSubmitButtonClassName() {
        const {isValidKey, rememberKey, useEncryption, password, confirmPassword, minPasswordLength} = this.state

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