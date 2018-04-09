import React from "react"
import WalletStore from "../../stores/WalletStore"
import UnlockedSuccessAlert from "./UnlockedSuccessAlert"
import MetaMaskForm from "./MetaMask/MetaMaskForm"

export default class MetaMask extends React.Component {
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
            return <UnlockedSuccessAlert message="You are now logged in with metamask"/>
        } else {
            return <MetaMaskForm/>
        }
    }
}