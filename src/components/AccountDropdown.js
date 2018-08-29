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
import {copyToClipboard} from "../util/Clipboard"
import Truncated from "./CustomComponents/Truncated"

class AccountDropdown extends React.Component {
    constructor(props) {
        super(props)
        this.onAccountStoreChange = this.onAccountStoreChange.bind(this)
        this.onWalletStoreChange = this.onWalletStoreChange.bind(this)
        this.createNewWallet = this.createNewWallet.bind(this)
        this.unlockWallet = this.unlockWallet.bind(this)
        this.disconnectWallet = this.disconnectWallet.bind(this)
        this.viewWallet = this.viewWallet.bind(this)
    }

    state = {
        account: null,
        popoverOpen: false,
        selectedAccountType: null,
        providedWeb3: {}
    }

    componentWillMount() {
        AccountStore.on("change", this.onAccountStoreChange)
        WalletStore.on("change", this.onWalletStoreChange)
    }

    componentWillUnmount() {
        AccountStore.removeListener("change", this.onAccountStoreChange)
        WalletStore.removeListener("change", this.onWalletStoreChange)
    }

    onAccountStoreChange() {
        const accountState = AccountStore.getAccountState()
        this.setState({
            account: accountState.account,
            selectedAccountType: accountState.selectedAccountType
        })
    }

    onWalletStoreChange() {
        this.setState({
            providedWeb3: WalletStore.getProvidedWeb3Info()
        })
    }

    disconnectWallet() {
        WalletDao.forgetStoredWallet()
        WalletActions.logout()
        EtherDeltaWeb3.initForAnonymous()
        this.closePopover()
    }

    unlockWallet() {
        if (Routes.Wallets !== this.props.history.location.pathname) {
            this.props.history.push(Routes.Wallets)
        } else {
            WalletActions.clearSelectedWalletType()
        }
        this.closePopover()
    }

    createNewWallet() {
        if (Routes.NewWallet !== this.props.history.location.pathname) {
            this.props.history.push(Routes.NewWallet)
        }
        this.closePopover()
    }

    viewWallet() {
        if (Routes.View !== this.props.history.location.pathname) {
            this.props.history.push(Routes.View)
        }

        this.closePopover()
    }

    togglePopover = (event) => {
        event.preventDefault()
        this.setState({
            popoverOpen: !this.state.popoverOpen
        })
    }

    closePopover = () => {
        this.setState({
            popoverOpen: false
        })
    }

    getAccountTypeName = (accountType) => {
        switch (accountType) {
            case AccountType.METAMASK:
                return 'Metamask'
            case AccountType.PRIVATE_KEY:
                return 'Private key'
            case AccountType.KEY_STORE_FILE:
                return 'Key file'
            case AccountType.LEDGER:
                return 'Ledger'
            case AccountType.VIEW:
                return 'View'
        }

        return ""
    }

    render() {
        const {account, popoverOpen, selectedAccountType, providedWeb3} = this.state
        const {available, isMainNet, netDescription, accountAvailable} = providedWeb3
        const truncatedAccount = account ? truncate(account, {left: 7, right: 5}) : ""
        const accountOrEmpty = account ? account : ""
        const accountLink = <small><a target="_blank" rel="noopener noreferrer" href={`${Config.getEtherscanUrl()}/address/${accountOrEmpty}`}>{accountOrEmpty}</a></small>
        const accountTypeName = this.getAccountTypeName(selectedAccountType)
        const accountImage = account == null ? <i className="fas fa-lg fa-user"></i> : <img width="20" height="20" src={toDataUrl(account)} className="mr-2"/>
        const unlockText = account == null ? "Unlock Wallet" : "Unlock A Different Wallet"
        return (
            <li className="nav-item dropdown">
                <button className="nav-link dropdown-toggle btn btn-link" style={{"height": "36px"}} id="navbarAccountDropdown" aria-haspopup="true" aria-expanded="false" onClick={this.togglePopover}>
                    {accountImage}
                    {truncatedAccount}&nbsp;&nbsp;
                </button>
                <Popover target="navbarAccountDropdown" isOpen={popoverOpen} placement="bottom" toggle={this.togglePopover}>
                    <PopoverBody>
                        <Conditional displayCondition={account != null}>
                            <form>
                                <div className="dropdown-item disabled">
                                    <div><strong>{accountTypeName} wallet address:</strong></div>
                                    <div className="mb-1">
                                        <Truncated left="7" right="5">{account}</Truncated>
                                        &nbsp;<Etherscan type="address" address={account} display="icon"/></div>

                                    <button className="btn btn-primary btn-sm" onClick={(e) => copyToClipboard(account, e)}><i className="fas fa-copy"></i> Copy address</button>
                                </div>

                                <div className="dropdown-divider"></div>
                            </form>
                        </Conditional>
                        <button className="dropdown-item clickable" type="button" onClick={this.unlockWallet}><i className="fas fa-sign-in-alt text-muted"></i>&nbsp;&nbsp;{unlockText}</button>
                        <button className="dropdown-item clickable" type="button" onClick={this.createNewWallet}><i className="fas fa-plus text-muted"></i>&nbsp;&nbsp;Create New Wallet</button>
                        <button className="dropdown-item clickable" type="button" onClick={this.viewWallet}><i className="fas fa-eye text-muted"></i>&nbsp;&nbsp;View Wallet</button>
                        <Conditional displayCondition={account != null}>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item clickable" type="button" onClick={this.disconnectWallet}><i className="fas fa-sign-out-alt text-muted"></i>&nbsp;&nbsp;Disconnect</button>
                        </Conditional>
                    </PopoverBody>
                </Popover>
            </li>
        )
    }
}

export default withRouter(AccountDropdown)