import React from "react"
import WalletStore from "../../../stores/WalletStore"
import * as WalletActions from "../../../actions/WalletActions"
import EtherDeltaWeb3 from "../../../EtherDeltaWeb3"
import * as AccountActions from "../../../actions/AccountActions"
import * as KeyUtil from "../../../util/KeyUtil"
import AccountType from "../../../AccountType"
import * as WalletDao from "../../../util/WalletDao"
import PasswordSection from "./KeyStoreForm/PasswordSection"
import FileChooser from "./KeyStoreForm/FileChooser"
import Conditional from "../../Conditional"

export default class KeyStoreFile extends React.Component {
    state = {
        selectedKeyStoreFile: null,
        keyStoreFileName: null,
        fileParseError: null,
        passwordError: null,
        currentAccountType: null,
        rememberKeyStoreFile: false,
        keyStorePassword: null
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
            selectedKeyStoreFile: WalletStore.getKeyStoreFile(),
            keyStoreFileName: WalletStore.getKeyStoreFilename(),
            fileParseError: WalletStore.getFileParseError(),
            keyStorePassword: WalletStore.getKeyStorePassword(),
            rememberKeyStoreFile: WalletStore.isRememberKeyStoreFile(),
            passwordError: WalletStore.getKeyStorePasswordError(),
        })
    }

    handleRemember = (event) => {
        WalletActions.changedKeyStoreRememberMe(event.target.checked)
    }

    handleKeyStoreFilePasswordChange = (event) => {
        WalletActions.changeKeyStorePassword(event.target.value)
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

    handleKeyStoreUnlock = (event) => {
        event.preventDefault()

        try {
            const {address, privateKey} = KeyUtil.convertKeyFileToAddressAndKey(this.state.selectedKeyStoreFile, this.state.keyStorePassword)

            EtherDeltaWeb3.initForPrivateKey(address, privateKey)
            AccountActions.refreshAccount(AccountType.KEY_STORE_FILE)

            if (this.state.rememberKeyStoreFile) {
                WalletDao.saveKeyStoreWallet(this.state.selectedKeyStoreFile, this.state.keyStoreFileName)
            } else {
                WalletDao.forgetStoredWallet()
            }
        } catch (error) {
            WalletActions.keyStorePasswordError(error)
        }
    }

    render() {
        const {keyStoreFileName, fileParseError, passwordError, rememberKeyStoreFile} = this.state

        const validFile = keyStoreFileName && !fileParseError

        return (
            <div>
                <h4>Use Wallet File</h4>

                <form onSubmit={this.handleKeyStoreUnlock}>

                    <FileChooser
                        fileName={keyStoreFileName}
                        fileParseError={fileParseError}
                        onKeyStoreFileChange={this.selectKeyStoreFile}
                    />

                    <Conditional displayCondition={validFile}>
                        <PasswordSection
                            passwordError={passwordError}
                            rememberKeyStoreFile={rememberKeyStoreFile}
                            onRememberChange={this.handleRemember}
                            onPasswordChange={this.handleKeyStoreFilePasswordChange}
                        />
                    </Conditional>

                </form>
            </div>
        )
    }
}