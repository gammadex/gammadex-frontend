import React from "react"
import TokenStore from '../stores/TokenStore'
import AccountStore from '../stores/AccountStore'
import TimerRelay from "../TimerRelay"
import AccountTable from '../components/Account/AccountTable'
import Config from '../Config'
import {Badge, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip} from 'reactstrap'
import {Box, BoxFooter} from "./CustomComponents/Box"

import * as AccountActions from "../actions/AccountActions"
import AccountType from "../AccountType"
import TruncatedAddress from "../components/CustomComponents/TruncatedAddress"
import { baseEthToWei, tokEthToWei } from "../EtherConversion";

export default class AccountDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = AccountStore.getAccountState()
        this.state.tooltipOpen = false;
        this.hideModal = this.hideModal.bind(this)
        this.onInputChange = this.onInputChange.bind(this)
        this.onAccountChange = this.onAccountChange.bind(this)
        this.onTokenChange = this.onTokenChange.bind(this)
        this.timerFired = this.timerFired.bind(this)
        this.toggle = this.toggle.bind(this);
    }

    componentWillMount() {
        if (this.state.accountRetrieved) {
            AccountActions.refreshEthAndTokBalance(this.state.account, TokenStore.getSelectedToken().address)
        }
    }

    componentDidMount() {
        AccountStore.on("change", this.onAccountChange)
        TokenStore.on("change", this.onTokenChange)
        TimerRelay.on("change", this.timerFired)
    }

    componentWillUnmount() {
        AccountStore.removeListener("change", this.onAccountChange)
        TokenStore.removeListener("change", this.onTokenChange)
        TimerRelay.removeListener("change", this.timerFired)
    }

    onInputChange(event) {
        AccountActions.depositWithdrawAmountUpdated(event.target.value)
    }

    onTokenChange() {
        if (this.state.accountRetrieved) {
            AccountActions.refreshEthAndTokBalance(this.state.account, TokenStore.getSelectedToken().address)
        }
    }

    timerFired() {
        if (this.state.accountRetrieved) {
            AccountActions.refreshNonce()
            AccountActions.refreshEthAndTokBalance(this.state.account, TokenStore.getSelectedToken().address)
        }
    }

    onAccountChange() {
        const accountState = AccountStore.getAccountState()

        if (accountState.account && this.state.account !== accountState.account) {
            AccountActions.refreshEthAndTokBalance(accountState.account, TokenStore.getSelectedToken().address)
        }

        this.setState(accountState)
    }

    toggle() {
        this.setState({
          tooltipOpen: !this.state.tooltipOpen
        });
      }

    hideModal() {
        AccountActions.depositWithdrawCancel()
    }

    submit() {
        this.hideModal()

        const {token} = this.props
        const {
            account,
            accountRetrieved,
            nonce,
            modalValue,
            modalIsEth,
            modalIsDeposit
        } = this.state

        if (modalIsDeposit) {
            if (modalIsEth) {
                AccountActions.depositEth(
                    account,
                    accountRetrieved,
                    nonce,
                    token.address,
                    baseEthToWei(modalValue))
            } else {
                AccountActions.depositTok(
                    account,
                    accountRetrieved,
                    nonce,
                    token.address,
                    tokEthToWei(modalValue))
            }
        } else {
            if (modalIsEth) {
                AccountActions.withdrawEth(
                    account,
                    accountRetrieved,
                    nonce,
                    token.address,
                    baseEthToWei(modalValue))
            } else {
                AccountActions.withdrawTok(
                    account,
                    accountRetrieved,
                    nonce,
                    token.address,
                    tokEthToWei(modalValue))
            }
        }
    }

    render() {
        const {token} = this.props
        const {
            selectedAccountType,
            account,
            accountRetrieved,
            nonce,
            walletBalanceEthWei,
            walletBalanceTokWei,
            exchangeBalanceEthWei,
            exchangeBalanceTokWei,
            ethTransaction,
            tokTransaction,
            modal,
            modalValue,
            modalIsEth,
            modalIsDeposit
        } = this.state

        const modalToken = (modalIsEth ? "ETH" : token.name)
        const modalTitle = (modalIsDeposit ? `Deposit ${modalToken} to Exchange` : `Withdraw ${modalToken} from Exchange`)
        const modalActionLabel = (modalIsDeposit ? "Deposit" : "Withdraw")

        const accountTypeName = (selectedAccountType === AccountType.METAMASK ? "MetaMask" : "Wallet")
        let accountLink = <span className="text-danger">No account</span>
        if (accountRetrieved) {
            accountLink = <TruncatedAddress url={`${Config.getEtherscanUrl()}/address/${account}`}>{account}</TruncatedAddress>
        }

        let nonceTip = ''
        if (selectedAccountType !== AccountType.METAMASK) {
            let ntext = `Nonce: ${nonce}`
            nonceTip = <Tooltip placement="right" isOpen={this.state.tooltipOpen} target="atName" toggle={this.toggle}>{ntext}</Tooltip>
        }

        return (
            <span>
                <Box title="Accounts">
                    <AccountTable
                        token={token}
                        walletBalanceEthWei={walletBalanceEthWei}
                        walletBalanceTokWei={walletBalanceTokWei}
                        exchangeBalanceEthWei={exchangeBalanceEthWei}
                        exchangeBalanceTokWei={exchangeBalanceTokWei}
                        ethTransaction={ethTransaction}
                        tokTransaction={tokTransaction}/>

                    <BoxFooter>
                        Account: {accountLink}
                        <br/>
                        <Badge id="atName" color="secondary">{accountTypeName}</Badge> {nonceTip}
                    </BoxFooter>
                </Box>

                <Modal isOpen={modal} toggle={this.hideModal} className={this.props.className}>
                    <ModalHeader toggle={this.hideModal}>{modalTitle}</ModalHeader>
                    <ModalBody>
                        <Input type="number" placeholder={modalToken} min={0} value={modalValue}
                               onChange={this.onInputChange.bind(this)}/>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.submit.bind(this)}>{modalActionLabel}</Button>
                    </ModalFooter>
                </Modal>
            </span>
        )
    }
}