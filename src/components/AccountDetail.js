import React from "react"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import TokenStore from '../stores/TokenStore'
import AccountStore from '../stores/AccountStore'
import AccountTable from '../components/Account/AccountTable'
import Config from '../Config'
import { Button, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

import * as AccountActions from "../actions/AccountActions"

export default class AccountDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            account: null,
            accountRetrieved: false,
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
        this.toggle = this.toggle.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
        this.onInputChange = this.onInputChange.bind(this)
    }

    componentWillMount() {
        AccountStore.on("change", this.onAccountChange)
        TokenStore.on("change", this.onTokenChange)
    }

    onInputChange(event) {
        this.setState({ modalValue: event.target.value })
    }

    onTokenChange = () => {
        if (this.state.accountRetrieved) {
            this.refreshEthAndTokBalance(this.state.account, TokenStore.getSelectedToken().address)
        }
    }

    onAccountChange = () => {
        const prevRetrieved = this.state.accountRetrieved
        this.setState(AccountStore.getAccountState())
        // TODO this is shit, need to rationalize the dependency between user and balance retrieval
        if (!prevRetrieved && this.state.accountRetrieved) {
            // i now have a user address so refresh balances
            this.refreshEthAndTokBalance(this.state.account, TokenStore.getSelectedToken().address)
        }
    }

    refreshEthAndTokBalance(account, tokenAddress) {
        EtherDeltaWeb3.refreshEthAndTokBalance(account, tokenAddress)
            .then(balance => AccountActions.balanceRetrieved(balance))
            .catch(error => console.log(`failed to refresh balances: ${error.message}`))
    }

    componentDidMount() {
        EtherDeltaWeb3.refreshAccount()
            .then(account => AccountActions.accountRetrieved(account))
            .catch(error => console.log(`failed to refresh user account: ${error.message}`))
    }

    toggleModal(isEth, isDeposit) {
        this.setState({
            modal: true,
            modalValue: '',
            modalIsEth: isEth,
            modalIsDeposit: isDeposit
        })
    }

    toggle() {
        this.setState({
            modal: !this.state.modal
        })
    }

    submit() {
        this.toggle()
        const { token } = this.props
        const tokenDecimals = Config.getTokenDecimals(token.name)
        const {
            modalValue,
            modalIsEth,
            modalIsDeposit } = this.state

        if (modalIsDeposit) {
            if (modalIsEth) {
                this.depositEth(Number(modalValue) * Math.pow(10,18))
            } else {
                this.depositTok(token.address, Number(modalValue) * Math.pow(10, tokenDecimals))
            }
        } else {
            if (modalIsEth) {
                this.withdrawEth(Number(modalValue) * Math.pow(10,18))
            } else {
                this.withdrawTok(token.address, Number(modalValue) * Math.pow(10, tokenDecimals))
            }
        }
    }

    depositEth(amount) {
        EtherDeltaWeb3.promiseDepositEther(amount)
            .then(tx => AccountActions.ethTransaction(tx))
            .catch(error => console.log(`failed to deposit ether: ${error.message}`))
    }

    withdrawEth(amount) {
        EtherDeltaWeb3.promiseWithdrawEther(amount)
            .then(tx => AccountActions.ethTransaction(tx))
            .catch(error => console.log(`failed to withdraw ether: ${error.message}`))
    }

    depositTok(tokenAddress, amount) {
        EtherDeltaWeb3.promiseDepositToken(tokenAddress, amount)
            .then(tx => AccountActions.tokTransaction(tx[1]))
            .catch(error => console.log(`failed to deposit token: ${error.message}`))
    }

    withdrawTok(tokenAddress, amount) {
        EtherDeltaWeb3.promiseWithdrawToken(tokenAddress, amount)
            .then(tx => AccountActions.tokTransaction(tx))
            .catch(error => console.log(`failed to deposit token: ${error.message}`))
    }

    render() {
        const { token } = this.props
        const tokenDecimals = Config.getTokenDecimals(token.name)
        const {
            account,
            accountRetrieved,
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

        let accountLink = <span className="text-danger">No account</span>
        if (accountRetrieved) {
            accountLink = <a href={`https://ropsten.etherscan.io/address/${account}`}>{account}</a>
        }

        return (
            <div>
                <h2>Balances</h2>
                <div className="row">
                    <div className="col-lg-12">
                        Account: {accountLink}
                    </div>
                    <div className="col-lg-12">
                        <AccountTable
                            base="ETH"
                            token={token.name}
                            baseDecimals={18}
                            tokenDecimals={tokenDecimals}
                            walletBalanceEthWei={walletBalanceEthWei}
                            walletBalanceTokWei={walletBalanceTokWei}
                            exchangeBalanceEthWei={exchangeBalanceEthWei}
                            exchangeBalanceTokWei={exchangeBalanceTokWei}
                            ethTransaction={ethTransaction}
                            tokTransaction={tokTransaction}
                            toggleModal={this.toggleModal.bind(this)} />
                    </div>
                </div>
                <Modal isOpen={modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>{modalTitle}</ModalHeader>
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