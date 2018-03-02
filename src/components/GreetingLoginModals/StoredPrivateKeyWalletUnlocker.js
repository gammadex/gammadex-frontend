import React from "react"
import WalletStore from "../../stores/WalletStore"
import * as WalletActions from "../../actions/WalletActions"
import * as KeyUtil from "../../util/KeyUtil"
import EtherDeltaWeb3 from "../../EtherDeltaWeb3"
import * as AccountActions from "../../actions/AccountActions"
import AccountType from "../../AccountType"
import * as WalletDao from "../../util/WalletDao"
import {Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap'
import * as Encryption from "../../util/Encryption"
import Empty from "../Empty"

export default class StoredPrivateKeyWalletUnlocker extends React.Component {
    state = {
        showModal: WalletStore.isDisplayUnlockPrivateKeyModal(),
        password: null,
        passwordError: null,
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
            showModal: WalletStore.isDisplayUnlockPrivateKeyModal(),
            password: WalletStore.getPrivateKeyUnlockPassword(),
            passwordError: WalletStore.getPasswordError(),
        })
    }

    handleUnlock = () => {
        const {key} = WalletDao.readWallet().data // TODO - WR- this could be sourced from WalletStore
        const {password} = this.state

        try {
            const privateKey = Encryption.decrypt(key, password)
            const {address} = KeyUtil.convertPrivateKeyToAddress(privateKey)

            EtherDeltaWeb3.initForPrivateKey(address, privateKey)
            AccountActions.refreshAccount(AccountType.PRIVATE_KEY)
        } catch (error) {
            WalletActions.passwordError(error)
        }
    }

    hideModal = () => {
        WalletActions.hideUnlockPrivateKeyModal()
    }

    handlePasswordChange = (event) => {
        WalletActions.changePrivateKeyUnlockPassword(event.target.value)
    }

    render() {
        const {showModal, passwordError} = this.state
        const passwordErrorClass = passwordError ? " is-invalid" : ""

        let passwordErrorDisplay = <Empty/>
        if (passwordError) {
            passwordErrorDisplay = <Alert color="danger">Sorry, wrong password. Please try again.</Alert>
        }

        return <Modal isOpen={showModal} toggle={this.hideModal}>
            <ModalHeader toggle={this.hideModal}>Unlock saved private key</ModalHeader>
            <ModalBody>
                <div className="form-group">
                    <input type="password"
                           name="password"
                           placeholder="Private key password"
                           className={"form-control " + passwordErrorClass}
                           onChange={this.handlePasswordChange}/>
                </div>

                {passwordErrorDisplay}

            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={this.handleUnlock}>Unlock</Button>
            </ModalFooter>
        </Modal>
    }
}