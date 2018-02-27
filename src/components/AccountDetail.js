import React from "react"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import TokenStore from '../stores/TokenStore'
import AccountStore from '../stores/AccountStore'
import AccountTable from '../components/Account/AccountTable'
import Config from '../Config'
import { Badge, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

import * as AccountActions from "../actions/AccountActions"
import AccountType from "../AccountType"

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
    }

    onInputChange(event) {
        AccountActions.depositWithdrawAmountUpdated(event.target.value)
    }

    onTokenChange = () => {
        if (this.state.accountRetrieved) {
            AccountActions.refreshEthAndTokBalance(this.state.account, TokenStore.getSelectedToken().address)
        }
    }

    onAccountChange = () => {
        const prevRetrieved = this.state.accountRetrieved
        this.setState(AccountStore.getAccountState())
        // TODO this is shit, need to rationalize the dependency between user and balance retrieval
        // TODO WR - I removed - !prevRetrieved && - so the component updates on account change
        // Let's clean this all up later
        if (/*!prevRetrieved &&*/ this.state.accountRetrieved) {
            // i now have a user address so refresh balances
            AccountActions.refreshEthAndTokBalance(this.state.account, TokenStore.getSelectedToken().address)
        }
    }

    componentDidMount() {
        AccountActions.refreshAccount()
    }

    hideModal() {
        AccountActions.depositWithdrawCancel()
    }

    submit() {
        this.hideModal()

        const { token } = this.props
        const tokenDecimals = Config.getTokenDecimals(token.name)
        const {
            account,
            accountRetrieved,
            nonce,
            modalValue,
            modalIsEth,
            modalIsDeposit } = this.state

        if (modalIsDeposit) {
            if (modalIsEth) {
                AccountActions.depositEth(
                    account,
                    accountRetrieved,
                    nonce,
                    token.address,
                    Number(modalValue) * Math.pow(10, Config.getBaseDecimals()))
            } else {
                AccountActions.depositTok(
                    account,
                    accountRetrieved,
                    nonce,
                    token.address, Number(modalValue) * Math.pow(10, tokenDecimals))
            }
        } else {
            if (modalIsEth) {
                AccountActions.withdrawEth(
                    account,
                    accountRetrieved,
                    nonce,
                    token.address,
                    Number(modalValue) * Math.pow(10, Config.getBaseDecimals()))
            } else {
                AccountActions.withdrawTok(
                    account,
                    accountRetrieved,
                    nonce,
                    token.address,
                    Number(modalValue) * Math.pow(10, tokenDecimals))
            }
        }
    }

    render() {
        const { token } = this.props
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
            modalIsDeposit } = this.state

        const modalToken = (modalIsEth ? "ETH" : token.name)
        const modalTitle = (modalIsDeposit ? `Deposit ${modalToken} to Exchange` : `Withdraw ${modalToken} from Exchange`)
        const modalActionLabel = (modalIsDeposit ? "Deposit" : "Withdraw")

        const accountTypeName = (accountType === AccountType.METAMASK ? "MetaMask" : "Wallet")
        let accountLink = <span className="text-danger">No account</span>
        if (accountRetrieved) {
            accountLink = <a target="_blank" rel="noopener" href={`${Config.getEtherscanUrl()}/address/${account}`}>{account}</a>
        }

        let nonceBadge = ''
        if (accountType !== AccountType.METAMASK) {
            nonceBadge = <Badge color="dark">nonce: {nonce}</Badge>
        }
        return (
            <div>
                <h2>Balances</h2>
                <div className="row">
                    <div className="col-lg-12">
                        Account: {accountLink} <Badge color="secondary">{accountTypeName}</Badge> {nonceBadge}
                    </div>
                    <div className="col-lg-12">
                        <AccountTable
                            base="ETH"
                            token={token.name}
                            baseDecimals={Config.getBaseDecimals()}
                            tokenDecimals={tokenDecimals}
                            walletBalanceEthWei={walletBalanceEthWei}
                            walletBalanceTokWei={walletBalanceTokWei}
                            exchangeBalanceEthWei={exchangeBalanceEthWei}
                            exchangeBalanceTokWei={exchangeBalanceTokWei}
                            ethTransaction={ethTransaction}
                            tokTransaction={tokTransaction} />
                    </div>
                </div>
                <Modal isOpen={modal} toggle={this.hideModal} className={this.props.className}>
                    <ModalHeader toggle={this.hideModal}>{modalTitle}</ModalHeader>
                    <ModalBody>
                        <Input type="number" placeholder={modalToken} min={0} value={modalValue} onChange={this.onInputChange.bind(this)} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.submit.bind(this)}>{modalActionLabel}</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}