import React, { Component } from 'react'
import { Box, BoxSection } from "./CustomComponents/Box"
import { withRouter } from "react-router-dom"
import CreateWallet from "./UserGuide/CreateWallet"
import UnlockMetaMaskWallet from "./UserGuide/UnlockMetaMaskWallet"
import UnlockPrivateKeyWallet from "./UserGuide/UnlockPrivateKeyWallet"
import DepositEth from "./UserGuide/DepositEth"
import DepositToken from "./UserGuide/DepositToken"
import Trade from "./UserGuide/Trade"
import Order from "./UserGuide/Order"
import UserGuideType from "./UserGuide/UserGuideType"
import UserGuideStore from "../stores/UserGuideStore"
import * as UserGuideActions from "../actions/UserGuideActions"

class UserGuideChooser extends Component {
    constructor(props) {
        super(props)

        this.onUserGuideStoreChange = this.onUserGuideStoreChange.bind(this)

        this.state = {
            selectedUserGuideType: UserGuideStore.getSelectedUserGuideType()
        }
    }

    componentDidMount() {
        UserGuideStore.on("change", this.onUserGuideStoreChange)
    }

    componentWillUnmount() {
        UserGuideStore.removeListener("change", this.onUserGuideStoreChange)
    }

    onUserGuideStoreChange() {
        this.setState({
            selectedUserGuideType: UserGuideStore.getSelectedUserGuideType()
        })
    }

    selectUserGuide = (userGuideType, e) => {
        e.preventDefault()
        UserGuideActions.selectUserGuide(userGuideType)
    }

    render() {
        const panel = this.getPanelContents()
        return (
            <div className="row">
                <div className="col-lg-3">
                    <div className="user-guide-menu-container">
                        <h5>Wallets</h5>
                        <ul>
                            <li><button className="btn btn-link btn-lg" onClick={(e) => this.selectUserGuide(UserGuideType.CREATE_WALLET, e)}>Create a new wallet</button></li>
                            <li><button className="btn btn-link btn-lg" onClick={(e) => this.selectUserGuide(UserGuideType.UNLOCK_METAMASK, e)}>Unlock a MetaMask wallet</button></li>
                            <li><button className="btn btn-link btn-lg" onClick={(e) => this.selectUserGuide(UserGuideType.UNLOCK_PRIVATE_KEY, e)}>Unlock wallet using a Private Key</button></li>
                        </ul>
                        <h5>Funding</h5>
                        <ul>
                            <li><button className="btn btn-link btn-lg" onClick={(e) => this.selectUserGuide(UserGuideType.DEPOSIT_ETH, e)}>Deposit ETH to exchange</button></li>
                            <li><button className="btn btn-link btn-lg" onClick={(e) => this.selectUserGuide(UserGuideType.DEPOSIT_TOKEN, e)}>Deposit a Token to exchange</button></li>
                        </ul>
                        <h5>Trading</h5>
                        <ul>
                            <li><button className="btn btn-link btn-lg" onClick={(e) => this.selectUserGuide(UserGuideType.TRADE, e)}>Trade against an order on the book</button></li>
                            <li><button className="btn btn-link btn-lg" onClick={(e) => this.selectUserGuide(UserGuideType.ORDER, e)}>Place a new order</button></li>
                        </ul>
                    </div>
                </div>
                <div className="col-lg-9">{panel}</div>
            </div>
        )
    }

    getPanelContents() {
        const { selectedUserGuideType } = this.state

        let panel
        if (!selectedUserGuideType) {
            panel = <div>&nbsp;</div>
        } else if (selectedUserGuideType === UserGuideType.CREATE_WALLET) {
            panel = <CreateWallet />
        } else if (selectedUserGuideType === UserGuideType.UNLOCK_METAMASK) {
            panel = <UnlockMetaMaskWallet />
        } else if (selectedUserGuideType === UserGuideType.UNLOCK_PRIVATE_KEY) {
            panel = <UnlockPrivateKeyWallet />
        } else if (selectedUserGuideType === UserGuideType.DEPOSIT_ETH) {
            panel = <DepositEth />
        } else if (selectedUserGuideType === UserGuideType.DEPOSIT_TOKEN) {
            panel = <DepositToken />
        } else if (selectedUserGuideType === UserGuideType.TRADE) {
            panel = <Trade />
        } else if (selectedUserGuideType === UserGuideType.ORDER) {
            panel = <Order />
        }

        return panel
    }
}

export default withRouter(UserGuideChooser)
