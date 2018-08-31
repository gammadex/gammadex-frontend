import React, { Component } from 'react'
import { Box, BoxSection } from "./CustomComponents/Box"
import { withRouter } from "react-router-dom"
import CreateWallet from "./UserGuide/CreateWallet"
import UnlockMetaMaskWallet from "./UserGuide/UnlockMetaMaskWallet"
import UnlockPrivateKeyWallet from "./UserGuide/UnlockPrivateKeyWallet"
import DepositEth from "./UserGuide/DepositEth"
import DepositToken from "./UserGuide/DepositToken"
import Trade from "./UserGuide/Trade"
import UserGuideType from "./UserGuide/UserGuideType"

class UserGuideChooser extends Component {
    constructor(props) {
        super(props)

        this.state = {
            selectedUserGuideType: null
        }
    }

    selectUserGuide = (userGuideType, e) => {
        e.preventDefault()
        this.setState({
            selectedUserGuideType: userGuideType
        })
    }

    render() {
        const panel = this.getPanelContents()
        return (
            <Box>
                <BoxSection>
                    <div className="card-header">
                        <div className="card-title">How-to Guides</div>
                    </div>

                    <div className="row">
                        <div className="col-lg-3">
                            <div className="user-guide-menu-container">
                                <ul>
                                    <li><a href="#" onClick={(e) => this.selectUserGuide(UserGuideType.CREATE_WALLET, e)}>Create a new wallet</a></li>
                                    <li><a href="#" onClick={(e) => this.selectUserGuide(UserGuideType.UNLOCK_METAMASK, e)}>Unlock a MetaMask wallet</a></li>
                                    <li><a href="#" onClick={(e) => this.selectUserGuide(UserGuideType.UNLOCK_PRIVATE_KEY, e)}>Unlock wallet using a Private Key</a></li>
                                    <li><a href="#" onClick={(e) => this.selectUserGuide(UserGuideType.DEPOSIT_ETH, e)}>Deposit ETH to exchange</a></li>
                                    <li><a href="#" onClick={(e) => this.selectUserGuide(UserGuideType.DEPOSIT_TOKEN, e)}>Deposit a Token to exchange</a></li>
                                    <li><a href="#" onClick={(e) => this.selectUserGuide(UserGuideType.TRADE, e)}>Trade against an order on the book</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-9">{panel}</div>
                    </div>

                </BoxSection>
            </Box>
        )
    }

    getPanelContents() {
        const {selectedUserGuideType} = this.state

        let panel
        if (!selectedUserGuideType) {
            panel = <div>&nbsp;</div>
        } else if (selectedUserGuideType === UserGuideType.CREATE_WALLET) {
            panel = <CreateWallet/>
        } else if (selectedUserGuideType === UserGuideType.UNLOCK_METAMASK) {
            panel = <UnlockMetaMaskWallet/>
        } else if (selectedUserGuideType === UserGuideType.UNLOCK_PRIVATE_KEY) {
            panel = <UnlockPrivateKeyWallet/>
        } else if (selectedUserGuideType === UserGuideType.DEPOSIT_ETH) {
            panel = <DepositEth/>
        } else if (selectedUserGuideType === UserGuideType.DEPOSIT_TOKEN) {
            panel = <DepositToken/>
        } else if (selectedUserGuideType === UserGuideType.TRADE) {
            panel = <Trade/>
        }

        return panel
    }
}

export default withRouter(UserGuideChooser)
