import React from "react"
import WalletStore from "../../stores/WalletStore"
import * as WalletActions from "../../actions/WalletActions"
import * as KeyUtil from "../../util/KeyUtil"
import EtherDeltaWeb3 from "../../EtherDeltaWeb3"
import * as AccountActions from "../../actions/AccountActions"
import AccountType from "../../AccountType"
import * as WalletDao from "../../util/WalletDao"
import {Modal, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap'
import * as Encryption from "../../util/Encryption"
import Conditional from "../CustomComponents/Conditional"
import * as AccountApi from "../../apis/AccountApi"
import { toDataUrl } from '../../lib/blockies.js'

export default class StoredPrivateKeyWalletUnlocker extends React.Component {
    constructor(props) {
        super(props)

        const storedWallet = WalletDao.readWallet()
        this.state = {
            showModal: WalletStore.isDisplayUnlockPrivateKeyModal(),
            address: storedWallet && storedWallet.type === AccountType.PRIVATE_KEY ? storedWallet.data.address : "",
            password: null,
            passwordError: null,
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
            showModal: WalletStore.isDisplayUnlockPrivateKeyModal(),
            password: WalletStore.getPrivateKeyUnlockPassword(),
            passwordError: WalletStore.getPasswordError(),
        })
    }

    handleUnlock = (event) => {
        event.preventDefault()

        const {key} = WalletDao.readWallet().data
        const {password} = this.state

        try {
            const privateKey = Encryption.decrypt(key, password)
            const {address} = KeyUtil.convertPrivateKeyToAddress(privateKey)

            EtherDeltaWeb3.initForPrivateKey(address, privateKey)
            AccountApi.refreshAccountThenEthAndTokBalance(AccountType.PRIVATE_KEY)
        } catch (error) {
            WalletActions.passwordError(error)
        }
    }

    handleDisconnect = (event) => {
        event.preventDefault()
        this.hideModal()
        WalletDao.forgetStoredWallet()
        WalletActions.logout()
        EtherDeltaWeb3.initForAnonymous()
    }

    hideModal = () => {
        WalletActions.hideUnlockPrivateKeyModal()
    }

    handlePasswordChange = (event) => {
        WalletActions.changePrivateKeyUnlockPassword(event.target.value)
    }

    render() {
        const {showModal, passwordError, address} = this.state
        const passwordErrorClass = passwordError ? " is-invalid" : ""

        const walletImg = (!address || address === "") ? null : <img width="20" height="20" src={toDataUrl(address)}/>

        return <Modal isOpen={showModal} toggle={this.hideModal} keyboard>
            <ModalHeader toggle={this.hideModal}><p className="text-muted">Unlock saved wallet</p>{walletImg}&nbsp;&nbsp;{address}</ModalHeader>
            <form onSubmit={this.handleUnlock}>
                <ModalBody>

                    <div className="form-group">
                        <input type="text"
                            readOnly
                            name="username"
                            hidden={true}
                            value={address}/>
                    </div>

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
                    <input className="btn btn-secondary" type="button" onClick={this.handleDisconnect} value="Disconnect"/>
                    <input className="btn btn-primary" type="submit" value="Unlock"/>
                </ModalFooter>
            </form>
        </Modal>
    }
}