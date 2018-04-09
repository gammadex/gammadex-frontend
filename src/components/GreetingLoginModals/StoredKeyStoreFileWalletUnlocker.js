import React from "react"
import WalletStore from "../../stores/WalletStore"
import * as WalletActions from "../../actions/WalletActions"
import EtherDeltaWeb3 from "../../EtherDeltaWeb3"
import * as AccountActions from "../../actions/AccountActions"
import * as KeyUtil from "../../util/KeyUtil"
import AccountType from "../../AccountType"
import * as WalletDao from "../../util/WalletDao"
import {Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap'
import Conditional from "../CustomComponents/Conditional"

export default class StoredKeyStoreFileWalletUnlocker extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            showModal: WalletStore.isDisplayUnlockKeyStoreModal(),
            keyStorePassword: null,
            fileName: "",
            passwordError: null,
        }

        this.onWalletStoreChange = this.onWalletStoreChange.bind(this)
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

    onWalletStoreChange() {
        this.setState({
            showModal: WalletStore.isDisplayUnlockKeyStoreModal(),
            keyStorePassword: WalletStore.getKeyStorePassword(),
            fileName: WalletStore.getKeyStoreFilename(),
            passwordError: WalletStore.getPasswordError(),
        })
    }

    handleKeyStoreUnlock = (event) => {
        event.preventDefault()

        const {file, fileName} = WalletDao.readWallet().data // TODO - WR- this could be sourced from WalletStore
        WalletActions.selectedKeyStoreFile(file, fileName)

        try {
            const {address, privateKey} = KeyUtil.convertKeyFileToAddressAndKey(file, this.state.keyStorePassword)

            EtherDeltaWeb3.initForPrivateKey(address, privateKey)
            AccountActions.refreshAccount(AccountType.KEY_STORE_FILE)
        } catch (error) {
            WalletActions.passwordError(error)
        }
    }

    hideModal = () => {
        WalletActions.hideUnlockKeyStoreModal()
    }

    handleKeyStoreFilePasswordChange = (event) => {
        WalletActions.changeKeyStorePassword(event.target.value)
    }

    render() {
        const {showModal, passwordError, fileName} = this.state
        const passwordErrorClass = passwordError ? " is-invalid" : ""

        return <Modal isOpen={showModal} toggle={this.hideModal}>
            <ModalHeader toggle={this.hideModal}>Unlock saved keystore file {fileName}</ModalHeader>
            <form onSubmit={this.handleKeyStoreUnlock}>
                <ModalBody>
                    <div className="form-group">
                        <input type="password"
                               name="password"
                               placeholder="Keystore password"
                               className={"form-control " + passwordErrorClass}
                               onChange={this.handleKeyStoreFilePasswordChange}/>
                    </div>

                    <Conditional displayCondition={passwordError}>
                        <Alert color="danger">
                            Sorry, wrong password. Please try again.
                        </Alert>
                    </Conditional>

                </ModalBody>
                <ModalFooter>
                    <input className="btn btn-primary" type="submit" value="Unlock"/>
                </ModalFooter>
            </form>
        </Modal>
    }
}