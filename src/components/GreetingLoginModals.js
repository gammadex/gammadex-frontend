import React from "react"
import StoredKeyStoreFileWalletUnlocker from '../components/GreetingLoginModals/StoredKeyStoreFileWalletUnlocker'
import StoredPrivateKeyWalletUnlocker from '../components/GreetingLoginModals/StoredPrivateKeyWalletUnlocker'

export default class GreetingLoginModals extends React.Component {
    render() {
        return <span>
            <StoredKeyStoreFileWalletUnlocker/>
            <StoredPrivateKeyWalletUnlocker/>
        </span>
    }
}