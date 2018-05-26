import React from "react"
import { Popover, PopoverHeader, PopoverBody, Badge } from 'reactstrap'
import * as WalletActions from "../actions/WalletActions"
import * as AccountActions from "../actions/AccountActions"
import * as WalletDao from "../util/WalletDao"
import AccountStore from "../stores/AccountStore"
import Conditional from "./CustomComponents/Conditional"
import * as LifeCycleActions from "../actions/LifecycleActions"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import { toDataUrl } from '../lib/blockies.js'
import { truncate } from "../util/FormatUtil"
import { Box, BoxFooter, BoxSection } from "./CustomComponents/Box"
import TruncatedAddress from "../components/CustomComponents/TruncatedAddress"
import Config from '../Config'
import AccountType from '../AccountType'

export default class Account extends React.Component {
    constructor(props) {
        super(props)
        this.onAccountStoreChange = this.onAccountStoreChange.bind(this)
        this.toggerPopover = this.toggerPopover.bind(this)
    }
    state = {
        account: null,
        accountPopoverOpen: false,
        selectedAccountType: null
    }

    componentWillMount() {
        AccountStore.on("change", this.onAccountStoreChange)
    }

    componentWillUnmount() {
        AccountStore.removeListener("change", this.onAccountStoreChange)
    }

    onAccountStoreChange() {
        const accountState = AccountStore.getAccountState()
        this.setState({
            account: accountState.account,
            accountPopoverOpen: accountState.accountPopoverOpen,
            selectedAccountType: accountState.selectedAccountType
        })
    }

    toggerPopover() {
        AccountActions.toggleAccountPopover(!this.state.accountPopoverOpen)
    }

    disconnectWallet() {
        WalletDao.forgetStoredWallet()
        WalletActions.logout()
        EtherDeltaWeb3.initForAnonymous()
    }

    render() {
        const { account, accountPopoverOpen, selectedAccountType } = this.state
        const truncatedAccount = account ? truncate(account, { left: 7, right: 5 }) : ""
        const accountOrEmpty = account ? account : ""
        //const accountLink = <TruncatedAddress url={`${Config.getEtherscanUrl()}/address/${accountOrEmpty}`}>{accountOrEmpty}</TruncatedAddress>
        const accountLink = <a target="_blank" rel="noopener noreferrer" href={`${Config.getEtherscanUrl()}/address/${accountOrEmpty}`}>{accountOrEmpty}</a>
        const accountTypeName = (selectedAccountType === AccountType.METAMASK ? "MetaMask" : "Wallet")
        return (
            <div id="accountTop" className="form-group ml-1">
                <Conditional displayCondition={account}>
                    <img src={account == null ? null : toDataUrl(account)} className="wallet" />
                </Conditional>
                <Conditional displayCondition={account}>
                    <input type="button" className="btn" onClick={this.toggerPopover} value={truncatedAccount} />
                    <Popover placement="bottom" isOpen={accountPopoverOpen} target="accountTop" toggle={this.toggerPopover}>
                        <div className="shadow gas-prices">
                            <PopoverBody>
                                <Box title="Wallet Details">
                                    <BoxSection>
                                        <div className="row">
                                            <div className="col-lg-12 text-center">
                                                Etherscan:
                                                <br />
                                                {accountLink}
                                                <br />
                                                <Badge id="atName" color="secondary">{accountTypeName}</Badge>
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
                                </Box>
                            </PopoverBody>
                        </div>
                    </Popover>
                </Conditional>
            </div>
        )
    }
}