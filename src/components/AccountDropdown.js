import React from "react"
import { Popover, PopoverHeader, PopoverBody, Badge } from 'reactstrap'
import * as WalletActions from "../actions/WalletActions"
import * as AccountActions from "../actions/AccountActions"
import * as WalletDao from "../util/WalletDao"
import AccountStore from "../stores/AccountStore"
import WalletStore from "../stores/WalletStore"
import Conditional from "./CustomComponents/Conditional"
import * as LifeCycleActions from "../actions/LifecycleActions"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import { toDataUrl } from '../lib/blockies.js'
import { truncate } from "../util/FormatUtil"
import { Box, BoxFooter, BoxSection, BoxHeader } from "./CustomComponents/Box"
import TruncatedAddress from "../components/CustomComponents/TruncatedAddress"
import Config from '../Config'
import AccountType from '../AccountType'
import * as EthereumNetworks from "../util/EthereumNetworks"
import { withRouter } from "react-router-dom"
import Routes from '../Routes'
import Etherscan from "../components/CustomComponents/Etherscan"

class AccountDropdown extends React.Component {
    constructor(props) {
        super(props)
        this.onAccountStoreChange = this.onAccountStoreChange.bind(this)
        this.onWalletStoreChange = this.onWalletStoreChange.bind(this)
        this.toggerPopover = this.toggerPopover.bind(this)
        this.createNewWallet = this.createNewWallet.bind(this)
        this.unlockWallet = this.unlockWallet.bind(this)
    }

    state = {
        account: null,
        accountPopoverOpen: false,
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
            accountPopoverOpen: accountState.accountPopoverOpen,
            selectedAccountType: accountState.selectedAccountType
        })
    }

    onWalletStoreChange() {
        this.setState({
            providedWeb3: WalletStore.getProvidedWeb3Info()
        })
    }

    toggerPopover(e) {
        AccountActions.toggleAccountPopover(!this.state.accountPopoverOpen)

        e.preventDefault()
    }

    disconnectWallet() {
        WalletDao.forgetStoredWallet()
        WalletActions.logout()
        EtherDeltaWeb3.initForAnonymous()
    }

    unlockWallet() {
        if (Routes.Wallets !== this.props.history.location.pathname) {
            this.props.history.push(Routes.Wallets)
        } else {
            WalletActions.clearSelectedWalletType()
        }
    }

    createNewWallet() {
        if (Routes.NewWallet !== this.props.history.location.pathname) {
            this.props.history.push(Routes.NewWallet)
        }
    }
    
    render() {
        const { account, accountPopoverOpen, selectedAccountType, providedWeb3 } = this.state
        const { available, isMainNet, netDescription, accountAvailable } = providedWeb3
        const truncatedAccount = account ? truncate(account, { left: 7, right: 5 }) : ""
        const accountOrEmpty = account ? account : ""
        const accountLink = <small><a target="_blank" rel="noopener noreferrer" href={`${Config.getEtherscanUrl()}/address/${accountOrEmpty}`}>{accountOrEmpty}</a></small>
        const accountTypeName = (selectedAccountType === AccountType.METAMASK ? "MetaMask" : "Wallet")
        const accountImage = account == null ? <i className="fas fa-lg fa-user"></i> : <img width="20" height="20" src={toDataUrl(account)} className="mr-2" />
        const unlockText = account == null ? "Unlock Wallet" : "Unlock A Different Wallet"
        return (
            <li className="nav-item dropdown">
                <button className="nav-link dropdown-toggle btn btn-link" id="navbarAccountDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ "height": "36px" }} value={truncatedAccount}>
                    {accountImage}
                    {truncatedAccount}&nbsp;&nbsp;
                </button>
                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarAccountDropdown">
                    <Conditional displayCondition={account != null}>
                        <form>
                            <div className="dropdown-item disabled">
                                <h6><strong>Current wallet address:</strong></h6>
                                <div className="mb-1"><small>{account}</small>&nbsp;<Etherscan type="address" address={account} display="icon" /></div>
                            </div>
                            <div className="dropdown-divider"></div>
                        </form>
                    </Conditional>
                    <button className="dropdown-item" type="button" onClick={this.unlockWallet}><i className="fas fa-sign-in-alt text-muted"></i>&nbsp;&nbsp;{unlockText}</button>
                    <button className="dropdown-item" type="button" onClick={this.createNewWallet}><i className="fas fa-plus text-muted"></i>&nbsp;&nbsp;Create New Wallet</button>
                    <Conditional displayCondition={account != null}>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item" type="button" onClick={this.disconnectWallet}><i className="fas fa-sign-out-alt text-muted"></i>&nbsp;&nbsp;Disconnect</button>
                    </Conditional>
                </div>
            </li>
        )
    }
}

export default withRouter(AccountDropdown)