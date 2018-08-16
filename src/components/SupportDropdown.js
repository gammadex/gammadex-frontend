import React from "react"
import {Popover, PopoverHeader, PopoverBody, Badge} from 'reactstrap'
import * as WalletActions from "../actions/WalletActions"
import * as AccountActions from "../actions/AccountActions"
import * as WalletDao from "../util/WalletDao"
import AccountStore from "../stores/AccountStore"
import WalletStore from "../stores/WalletStore"
import Conditional from "./CustomComponents/Conditional"
import * as LifeCycleActions from "../actions/LifecycleActions"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import {toDataUrl} from '../lib/blockies.js'
import {truncate} from "../util/FormatUtil"
import {Box, BoxFooter, BoxSection, BoxHeader} from "./CustomComponents/Box"
import TruncatedAddress from "../components/CustomComponents/TruncatedAddress"
import Config from '../Config'
import AccountType from '../AccountType'
import * as EthereumNetworks from "../util/EthereumNetworks"
import {withRouter} from "react-router-dom"
import Routes from '../Routes'
import Etherscan from "../components/CustomComponents/Etherscan"

export default class SupportDropdown extends React.Component {
    state = {
        popoverOpen: false,
    }

    togglePopover = (event) => {
        event.preventDefault()
        this.setState({
            popoverOpen: !this.state.popoverOpen
        })
    }

    render() {
        const {popoverOpen} = this.state

        return (
            <li className="nav-item dropdown ">
                <button className="nav-link dropdown-toggle btn btn-link" style={{"height": "36px"}} id="navbarSupportDropdown" aria-haspopup="true" aria-expanded="false" onClick={this.togglePopover}>
                    <span style={{"verticalAlign": "middle"}} className="fas fa-lg  fa-hands-helping mr-2"></span><span className="no-mobile">Support</span>
                </button>

                <Popover target="navbarSupportDropdown" isOpen={popoverOpen} placement="bottom" toggle={this.togglePopover}>
                    <PopoverBody>
                        <a className="dropdown-item" target="_blank" rel="noopener noreferrer" href="https://t.me/GammaDEXchat"><i className="fab fa-telegram-plane"></i><span className="support-text">Telegram chat</span></a>
                        <a className="dropdown-item" target="_blank" rel="noopener noreferrer" href="https://discord.gg/RANPVZ5"><i className="fab fa-discord"></i><span className="support-text">Discord chat</span></a>
                        <a className="dropdown-item" target="_blank" rel="noopener noreferrer" href="https://twitter.com/_GammaDEX"><i className="fab fa-twitter"></i><span className="support-text">Twitter</span></a>
                        <a className="dropdown-item" target="_blank" rel="noopener noreferrer" href="https://www.reddit.com/r/GammaDEX"><i className="fab fa-reddit-alien"></i><span className="support-text">Reddit</span></a>
                    </PopoverBody>
                </Popover>
            </li>
        )
    }

}