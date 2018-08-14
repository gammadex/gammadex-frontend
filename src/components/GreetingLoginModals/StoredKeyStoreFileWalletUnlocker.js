import React from "react"
import WalletStore from "../../stores/WalletStore"
import * as WalletActions from "../../actions/WalletActions"
import EtherDeltaWeb3 from "../../EtherDeltaWeb3"
import * as AccountActions from "../../actions/AccountActions"
import * as KeyUtil from "../../util/KeyUtil"
import AccountType from "../../AccountType"
import * as WalletDao from "../../util/WalletDao"
import {Modal, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap'
import Conditional from "../CustomComponents/Conditional"
import * as AccountApi from "../../apis/AccountApi"
import { toDataUrl } from '../../lib/blockies.js'

export default class StoredKeyStoreFileWalletUnlocker extends React.Component {
    constructor(props) {
        super(props)

        const storedWallet = WalletDao.readWallet()
        this.state = {
            showModal: WalletStore.isDisplayUnlockKeyStoreModal(),
            address: storedWallet && storedWallet.type === AccountType.KEY_STORE_FILE ? storedWallet.data.address : "",
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

        const {file, fileName} = WalletDao.readWallet().data
        WalletActions.selectedKeyStoreFile(file, fileName)

        try {
            const {address, privateKey} = KeyUtil.convertKeyFileToAddressAndKey(file, this.state.keyStorePassword)

            EtherDeltaWeb3.initForPrivateKey(address, privateKey)
            AccountApi.refreshAccountThenEthAndTokBalance(AccountType.KEY_STORE_FILE)
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
        WalletActions.hideUnlockKeyStoreModal()
    }

    handleKeyStoreFilePasswordChange = (event) => {
        WalletActions.changeKeyStorePassword(event.target.value)
    }

    render() {
        const {showModal, passwordError, fileName, address} = this.state
        const passwordErrorClass = passwordError ? " is-invalid" : ""

        const walletImg = (!address || address === "") ? null : <img width="20" height="20" src={toDataUrl(address)}/>

        return <Modal isOpen={showModal} toggle={this.hideModal} keyboard>
            <ModalHeader toggle={this.hideModal}><p className="text-muted">Unlock saved keystore file {fileName}</p>{walletImg}&nbsp;&nbsp;{address}</ModalHeader>

            <form onSubmit={this.handleKeyStoreUnlock}>
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
                               placeholder="Keystore password"
                               className={"form-control " + passwordErrorClass}
                               onChange={this.handleKeyStoreFilePasswordChange}/>
                    </div>

                    <Conditional displayCondition={passwordError != null}>
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