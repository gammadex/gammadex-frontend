import React from "react"
import * as WalletActions from "../actions/WalletActions"
import * as WalletDao from "../util/WalletDao"
import AccountStore from "../stores/AccountStore"
import Conditional from "./Conditional"

export default class TokenChooser extends React.Component {
    state = {
        account: null
    }

    componentWillMount() {
        AccountStore.on("change", this.onAccountStoreChange)
    }

    componentWillUnmount() {
        AccountStore.removeListener("change", this.onAccountStoreChange)
    }

    onAccountStoreChange = () => {
        this.setState({
            account: AccountStore.getAccount(),
        })
    }

    handleLogout = () => {
        WalletDao.forgetStoredWallet()
        WalletActions.logout()
    }

    render() {
        const {account} = this.state

        return (
            <Conditional displayCondition={account}>
                <input type="button" className="btn" onClick={this.handleLogout} value="logout"/>
            </Conditional>
        )
    }
}