import React from "react"
import WalletStore from "../../stores/WalletStore"
import UnlockedSuccessAlert from "./UnlockedSuccessAlert"
import PrivateKeyForm from "./PrivateKey/PrivateKeyForm"

export default class PrivateKey extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            completedAccount: null
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
            completedAccount: WalletStore.getCompletedAccount(),
        })
    }

    render() {
        const {completedAccount} = this.state

        if (completedAccount) {
            return <UnlockedSuccessAlert message="You have unlocked a private key wallet "/>
        } else {
            return <PrivateKeyForm/>
        }
    }
}