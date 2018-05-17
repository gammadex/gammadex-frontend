import React from "react"
import Conditional from "./CustomComponents/Conditional"
import WalletStore from "../stores/WalletStore"
import AccountStore from "../stores/AccountStore"
import * as EthereumNetworks from "../util/EthereumNetworks"

export default class BrowserWeb3Warning extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            account: AccountStore.getAccount(),
            providedWeb3: WalletStore.getProvidedWeb3Info(),
        }

        this.onWalletStoreChange = this.onWalletStoreChange.bind(this)
        this.onAccountChange = this.onAccountChange.bind(this)
    }

    componentDidMount() {
        WalletStore.on("change", this.onWalletStoreChange)
        AccountStore.on("change", this.onAccountChange)
    }

    componentWillUnmount() {
        WalletStore.removeListener("change", this.onWalletStoreChange)
        AccountStore.removeListener("change", this.onAccountChange)
    }

    onWalletStoreChange() {
        this.setState({
            providedWeb3: WalletStore.getProvidedWeb3Info(),
        })
    }

    onAccountChange() {
        this.setState({
            account: AccountStore.getAccount(),
        })
    }

    render() {
        const {providedWeb3, account} = this.state
        const {isMainNet, netDescription} = providedWeb3
        const mainNetDescription = EthereumNetworks.getMainNetDescription()

        return (
            <Conditional displayCondition={netDescription && !isMainNet && ! account}>
                <div className="alert alert-danger">
                    <div>
                        <h3><i className="fas fa-exclamation-triangle"/> MetaMask is connected to the {netDescription}
                        </h3>
                    </div>
                    <div>
                        If you wish to use MetaMask as your wallet, please connect to the {mainNetDescription}
                    </div>
                </div>
            </Conditional>
        )
    }
}