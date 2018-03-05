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
import Conditional from "../Conditional"

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

    handleUnlock = (event) => {
        event.preventDefault()

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

        return <Modal isOpen={showModal} toggle={this.hideModal}>
            <ModalHeader toggle={this.hideModal}>Unlock saved private key</ModalHeader>
            <form onSubmit={this.handleUnlock}>
            <ModalBody>
                <div className="form-group">
                    <input type="password"
                           name="password"
                           placeholder="Private key password"
                           className={"form-control " + passwordErrorClass}
                           onChange={this.handlePasswordChange}/>
                </div>

                <Conditional displayCondition={passwordError}>
                    <Alert color="danger">
                        Sorry, wrong password. Please try again.
                    </Alert>
                </Conditional>

            </ModalBody>
            <ModalFooter>
                <input className="btn btn-primary" type="submit"  value="Unlock" />
            </ModalFooter>
            </form>
        </Modal>
    }
}