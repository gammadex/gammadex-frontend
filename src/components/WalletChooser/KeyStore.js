import React from "react"
import WalletStore from "../../stores/WalletStore"
import * as WalletActions from "../../actions/WalletActions"
import * as EthJsUtil from "ethereumjs-util"
import EtherDeltaWeb3 from "../../EtherDeltaWeb3"
import * as AccountActions from "../../actions/AccountActions"
import * as KeyUtil from "../../util/KeyUtil"
import keythereum from "keythereum"
import AccountType from "../../AccountType"

export default class KeyStoreFile extends React.Component {
    state = {
        selectedKeyStoreFile: null,
        selectedKeyStoreFileName: null,
        fileParseError: null,
        passwordError: null,
        currentAccountType: null,
        completedAccount: null,
        completedAccountType: null
    }

    componentDidMount() {
        WalletStore.on("change", this.onWalletStoreChange)
    }

    componentWillUnmount() {
        WalletStore.removeListener("change", this.onWalletStoreChange)
    }

    onWalletStoreChange = () => {
        this.setState((prevState, props) => {
            return {
                selectedKeyStoreFile: WalletStore.getKeyStoreFile(),
                selectedKeyStoreFileName: WalletStore.getKeyStoreFilename(),
                completedAccount: WalletStore.getCompletedAccount(),
                fileParseError: WalletStore.getFileParseError(),
                completedAccountType: WalletStore.getCompletedAccountType(),
                enteredKeyStorePassword: WalletStore.getKeyStorePassword(),
            }
        })
    }

    selectKeyStoreFile = (event) => {
        if (event.target.files.length) {
            const filename = event.target.files[0].name

            const fileReader = new FileReader()
            fileReader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result)
                    WalletActions.selectedKeyStoreFile(json, filename)
                } catch (error) {
                    WalletActions.invalidKeyStoreFile(error, filename)
                }
            }
            fileReader.readAsText(event.target.files[0])
        }
    }

    handleKeyStoreFilePasswordChange = (event) => {
        WalletActions.changeKeyStorePassword(event.target.value)
    }

    handleKeyStoreUnlock = (event) => {
        try {
            const privateKeyBuffer = keythereum.recover(this.state.enteredKeyStorePassword, this.state.selectedKeyStoreFile)
            const privateKeyAddress = EthJsUtil.bufferToHex(EthJsUtil.privateToAddress(privateKeyBuffer))
            const privateKey = KeyUtil.removeHexPrefix(EthJsUtil.bufferToHex(privateKeyBuffer))

            EtherDeltaWeb3.initForPrivateKey(privateKeyAddress, privateKey)
            EtherDeltaWeb3.refreshAccount()
                .then(account => AccountActions.accountRetrieved(account, AccountType.KEY_STORE_FILE))
                .catch(error => console.log(`failed to refresh user account: ${error.message}`))
        } catch (error) {
            this.setState((prevState, props) => ({
                passwordError: error
            }))
        }
    }

    render() {
        const {completedAccount} = this.state

        if (completedAccount) {
            return this.getUnlockedMessage()
        } else {
            return this.getKeystoreForm()
        }
    }

    getUnlockedMessage() {
        return <div>
            <div className="alert alert-success">
                You are now logged in with a keystore wallet
            </div>
        </div>
    }

    getKeystoreForm() {
        const fileInputFormPart = this.getFileInputFormPart()
        const passwordFormPart = this.getPasswordFormPart()

        return (
            <div>
                <h4>Use Wallet File</h4>

                {fileInputFormPart}

                {passwordFormPart}
            </div>
        )
    }

    getFileInputFormPart() {
        const {selectedKeyStoreFileName, fileParseError} = this.state

        const filename = selectedKeyStoreFileName ? selectedKeyStoreFileName : "Select key store file"
        const fileErrorClass = fileParseError ? "form-control is-invalid" : ""

        return <div className="form-group">
            <div className="custom-file ">
                <input type="file"
                       id="keystore"
                       className="custom-file-input"
                       onChange={this.selectKeyStoreFile}/>

                <label htmlFor="keystore" className={"custom-file-label " + fileErrorClass}>{filename}</label>
            </div>
        </div>
    }

    getPasswordFormPart() {
        const {selectedKeyStoreFileName, fileParseError, passwordError} = this.state

        const validSelectedFile = selectedKeyStoreFileName && !fileParseError
        const passwordErrorClass = passwordError ? " is-invalid" : ""

        if (validSelectedFile) {
            return <div>
                <div className="form-group">
                    <input type="password"
                           placeholder="Keystore password"
                           className={"form-control " + passwordErrorClass}
                           onChange={this.handleKeyStoreFilePasswordChange}/>
                </div>

                <div className="form-group">
                    <a href="#" className="btn btn-primary"
                       onClick={this.handleKeyStoreUnlock}>Unlock</a>
                </div>
            </div>
        } else {
            return <div>&nbsp;</div>
        }
    }
}