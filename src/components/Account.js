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

class Account extends React.Component {
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
        this.props.history.push(Routes.Wallets)
    }

    createNewWallet() {
        this.props.history.push(Routes.NewWallet)

    }

    render() {
        const { account, accountPopoverOpen, selectedAccountType, providedWeb3 } = this.state
        const { available, isMainNet, netDescription, accountAvailable } = providedWeb3
        const truncatedAccount = account ? truncate(account, { left: 7, right: 5 }) : "No Wallet"
        const accountOrEmpty = account ? account : ""
        const accountLink = <small><a target="_blank" rel="noopener noreferrer" href={`${Config.getEtherscanUrl()}/address/${accountOrEmpty}`}>{accountOrEmpty}</a></small>
        const accountTypeName = (selectedAccountType === AccountType.METAMASK ? "MetaMask" : "Wallet")
        const accountImage = account == null ? null : <img width="16" height="16" src={toDataUrl(account)} className="mr-2" />
        return (
            <div id="accountTop" className="form-group ml-1">
                <button className="btn" onClick={this.toggerPopover} value={truncatedAccount}>{accountImage}{truncatedAccount}</button>

                <Popover placement="bottom" isOpen={accountPopoverOpen} target="accountTop" toggle={this.toggerPopover}>
                    <div className="shadow gas-prices">
                        <PopoverBody>
                            <Conditional displayCondition={account != null}>
                                <Box>
                                    <BoxHeader>
                                        <div className="row">
                                            <div className="col-lg-12 text-center">
                                                <strong>{accountTypeName} Connected</strong>
                                            </div>
                                        </div>
                                    </BoxHeader>
                                    <BoxSection>
                                        <div className="row">
                                            <div className="col-lg-12 text-center">
                                                Address (open in Etherscan)
                                                <br />
                                                {accountLink}
                                            </div>
                                        </div>
                                    </BoxSection>
                                    <BoxFooter>
                                        <div className="row">
                                            <div className="col-lg-12 text-center">
                                                <button className="btn" onClick={this.disconnectWallet}>Disconnect</button>
                                            </div>
                                        </div>
                                    </BoxFooter>
                                    <hr/>
                                    <BoxSection>
                                        <div className="row">
                                            <div className="col-lg-12 text-center">
                                                <button className="btn" onClick={this.unlockWallet}>Unlock Wallet</button>
                                            </div>
                                        </div>
                                    </BoxSection>
                                    <BoxSection>
                                        <div className="row">
                                            <div className="col-lg-12 text-center">
                                                <button className="btn" onClick={this.createNewWallet}>New Wallet</button>
                                            </div>
                                        </div>
                                    </BoxSection>                                    
                                </Box>
                            </Conditional>
                            <Conditional displayCondition={account == null}>
                                <Box>
                                    <BoxSection>
                                        <div className="row">
                                            <div className="col-lg-12 text-center">
                                                <button className="btn" onClick={this.unlockWallet}>Unlock Wallet</button>
                                            </div>
                                        </div>
                                    </BoxSection>
                                    <BoxSection>
                                        <div className="row">
                                            <div className="col-lg-12 text-center">
                                                <button className="btn" onClick={this.createNewWallet}>New Wallet</button>
                                            </div>
                                        </div>
                                    </BoxSection>
                                </Box>
                            </Conditional>
                        </PopoverBody>
                    </div>
                </Popover>
            </div>
        )
    }
}

export default withRouter(Account)