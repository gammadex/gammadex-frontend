import React from "react"
import * as WalletActions from "../actions/WalletActions"
import * as WalletDao from "../util/WalletDao"
import AccountStore from "../stores/AccountStore"
import Conditional from "./CustomComponents/Conditional"

export default class Logout extends React.Component {
    constructor(props) {
        super(props)
        this.onAccountStoreChange = this.onAccountStoreChange.bind(this)
    }
    state = {
        account: null
    }

    componentWillMount() {
        AccountStore.on("change", this.onAccountStoreChange)
    }

    componentWillUnmount() {
        AccountStore.removeListener("change", this.onAccountStoreChange)
    }

    onAccountStoreChange() {
        console.log("@@@@@@@@ Logout updated")
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