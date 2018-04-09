import React from "react"
import WalletStore from "../../stores/WalletStore"
import UnlockedSuccessAlert from "./UnlockedSuccessAlert"
import KeyStoreForm from "./KeyStore/KeyStoreForm"

export default class KeyStoreFile extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            completedAccount: null,
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
            completedAccount: WalletStore.getCompletedAccount(),
        })
    }

    render() {
        const {completedAccount} = this.state

        if (completedAccount) {
            return <UnlockedSuccessAlert message="You are now logged in with a keystore wallet"/>
        } else {
            return <KeyStoreForm/>
        }
    }
}