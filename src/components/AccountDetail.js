import React from "react"
import TokenStore from '../stores/TokenStore'
import AccountStore from '../stores/AccountStore'
import TimerRelay from "../TimerRelay"
import AccountTable from '../components/Account/AccountTable'
import Config from '../Config'
import {Badge, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'

import * as AccountActions from "../actions/AccountActions"
import AccountType from "../AccountType"
import TruncatedAddress from "../components/CustomComponents/TruncatedAddress"
import { baseEthToWei, tokEthToWei } from "../EtherConversion";

export default class AccountDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            account: null,
            accountRetrieved: false,
            nonce: 0,
            walletBalanceEthWei: 0,
            walletBalanceTokWei: 0,
            exchangeBalanceEthWei: 0,
            exchangeBalanceTokWei: 0,
            ethTransaction: null,
            tokTransaction: null,
            modal: false,
            modalValue: '',
            modalIsEth: false,
            modalIsDeposit: false
        }
        this.hideModal = this.hideModal.bind(this)
        this.onInputChange = this.onInputChange.bind(this)
    }

    componentWillMount() {
        AccountStore.on("change", this.onAccountChange)
        TokenStore.on("change", this.onTokenChange)
        TimerRelay.on("change", this.timerFired)
    }

    onInputChange(event) {
        AccountActions.depositWithdrawAmountUpdated(event.target.value)
    }

    onTokenChange = () => {
        if (this.state.accountRetrieved) {
            console.log("woot")
            AccountActions.refreshEthAndTokBalance(this.state.account, TokenStore.getSelectedToken().address)
        }
    }

    timerFired = () => {
        if (this.state.accountRetrieved) {
            AccountActions.refreshNonce()
            AccountActions.refreshEthAndTokBalance(this.state.account, TokenStore.getSelectedToken().address)
        }
    }

    onAccountChange = () => {
        // TODO this is shit, need to rationalize the dependency between user and balance retrieval
        const accountState = AccountStore.getAccountState()

        if (accountState.account && this.state.account !== accountState.account) {
            AccountActions.refreshEthAndTokBalance(accountState.account, TokenStore.getSelectedToken().address)
        }

        this.setState(accountState)
    }

    hideModal() {
        AccountActions.depositWithdrawCancel()
    }

    submit() {
        this.hideModal()

        const {token} = this.props
        const tokenDecimals = Config.getTokenDecimals(token.name)
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
        const tokenDecimals = Config.getTokenDecimals(token.name)
        const {
            accountType,
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

        const accountTypeName = (accountType === AccountType.METAMASK ? "MetaMask" : "Wallet")
        let accountLink = <span className="text-danger">No account</span>
        if (accountRetrieved) {
            accountLink = <TruncatedAddress url={`${Config.getEtherscanUrl()}/address/${account}`}>{account}</TruncatedAddress>
        }

        let nonceBadge = ''
        if (accountType !== AccountType.METAMASK) {
            nonceBadge = <Badge color="dark">nonce: {nonce}</Badge>
        }
        return (
            <span>
                <div className="card">
                    <div className="card-header">
                        <strong className="card-title">Accounts</strong>
                    </div>

                    <AccountTable
                        token={token}
                        walletBalanceEthWei={walletBalanceEthWei}
                        walletBalanceTokWei={walletBalanceTokWei}
                        exchangeBalanceEthWei={exchangeBalanceEthWei}
                        exchangeBalanceTokWei={exchangeBalanceTokWei}
                        ethTransaction={ethTransaction}
                        tokTransaction={tokTransaction}/>

                    <div className="card-footer">
                        Account: {accountLink}
                        <br/>
                        <Badge color="secondary">{accountTypeName}</Badge> {nonceBadge}
                    </div>
                </div>

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