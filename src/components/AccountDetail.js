import React from "react"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import TokenStore from '../stores/TokenStore'
import AccountStore from '../stores/AccountStore'
import AccountTable from '../components/Account/AccountTable'
import Config from '../Config'
import { Badge, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

import * as AccountActions from "../actions/AccountActions"

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
            .catch(error => AccountActions.balanceRetrievalFailed())
    }

    componentDidMount() {
        AccountActions.accountTypeResolved(EtherDeltaWeb3.getIsMetaMask())
        EtherDeltaWeb3.refreshAccount()
            .then(account => AccountActions.accountRetrieved(account))
            .catch(error => console.log(`failed to refresh user account: ${error.message}`))
    }

    hideModal() {
        AccountActions.depositWithdrawCancel()
    }

    submit() {
        this.hideModal()

        const { token } = this.props
        const tokenDecimals = Config.getTokenDecimals(token.name)
        const {
            modalValue,
            modalIsEth,
            modalIsDeposit } = this.state

        if (modalIsDeposit) {
            if (modalIsEth) {
                this.depositEth(Number(modalValue) * Math.pow(10, 18))
            } else {
                this.depositTok(token.address, Number(modalValue) * Math.pow(10, tokenDecimals))
            }
        } else {
            if (modalIsEth) {
                this.withdrawEth(Number(modalValue) * Math.pow(10, 18))
            } else {
                this.withdrawTok(token.address, Number(modalValue) * Math.pow(10, tokenDecimals))
            }
        }
    }

    depositEth(amount) {
        const { account, accountRetrieved, nonce } = this.state
        if (accountRetrieved) {
            EtherDeltaWeb3.promiseDepositEther(account, nonce, amount)
                .once('transactionHash', hash => { AccountActions.ethTransaction(hash) })
                .on('error', error => { console.log(`failed to deposit ether: ${error.message}`) })
                .then(receipt => {
                    // will be fired once the receipt is mined
                    this.refreshEthAndTokBalance(this.state.account, TokenStore.getSelectedToken().address)
                })
        }
    }

    withdrawEth(amount) {
        const { account, accountRetrieved } = this.state
        if (accountRetrieved) {
            EtherDeltaWeb3.promiseWithdrawEther(account, amount)
                .once('transactionHash', hash => { AccountActions.ethTransaction(hash) })
                .on('error', error => { console.log(`failed to withdraw ether: ${error.message}`) })
                .then(receipt => {
                    this.refreshEthAndTokBalance(account, TokenStore.getSelectedToken().address)
                })
        }
    }

    depositTok(tokenAddress, amount) {
        // depositing an ERC-20 token is two-step:
        // 1) call the token contract to approve the transfer to the destination address = ED
        // 2) initiate the transfer in the ED smart contract
        const { account, accountRetrieved } = this.state
        if (accountRetrieved) {
            EtherDeltaWeb3.promiseDepositToken(account, tokenAddress, amount)
                .once('transactionHash', hash => { AccountActions.tokTransaction(hash) })
                .on('error', error => { console.log(`failed to deposit token: ${error.message}`) })
                .then(receipt => {
                    this.refreshEthAndTokBalance(account, TokenStore.getSelectedToken().address)
                })
        }
    }

    withdrawTok(tokenAddress, amount) {
        const { account, accountRetrieved } = this.state
        if (accountRetrieved) {
            EtherDeltaWeb3.promiseWithdrawToken(account, tokenAddress, amount)
                .once('transactionHash', hash => { AccountActions.tokTransaction(hash) })
                .on('error', error => { console.log(`failed to deposit token: ${error.message}`) })
                .then(receipt => {
                    this.refreshEthAndTokBalance(this.state.account, TokenStore.getSelectedToken().address)
                })
        }
    }

    render() {
        const { token } = this.props
        const tokenDecimals = Config.getTokenDecimals(token.name)
        const {
            isMetaMask,
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

        const accountType = (isMetaMask ? "MetaMask" : "Wallet")
        let accountLink = <span className="text-danger">No account</span>
        if (accountRetrieved) {
            accountLink = <a href={`https://ropsten.etherscan.io/address/${account}`}>{account}</a>
        }

        return (
            <div>
                <h2>Balances</h2>
                <div className="row">
                    <div className="col-lg-12">
                        Account: {accountLink} <Badge color="secondary">{accountType}</Badge>
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