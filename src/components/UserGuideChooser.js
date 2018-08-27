import React, { Component } from 'react'
import { Box, BoxSection } from "./CustomComponents/Box"
import { withRouter } from "react-router-dom"
import CreateWallet from "./UserGuide/CreateWallet"
import UnlockWallet from "./UserGuide/UnlockWallet"
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
                                    <li><a href="#" onClick={(e) => this.selectUserGuide(UserGuideType.UNLOCK_WALLET, e)}>Unlock an existing wallet</a></li>
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
        } else if (selectedUserGuideType === UserGuideType.UNLOCK_WALLET) {
            panel = <UnlockWallet/>
        }

        return panel
    }
}

export default withRouter(UserGuideChooser)
