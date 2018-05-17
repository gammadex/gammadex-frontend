import React from "react"
import TokenStore from '../stores/TokenStore'
import AccountStore from '../stores/AccountStore'
import GasPriceStore from '../stores/GasPriceStore'
import AccountTable from '../components/Account/AccountTable'
import Config from '../Config'
import {Badge, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip} from 'reactstrap'
import {Box, BoxFooter, BoxSection} from "./CustomComponents/Box"

import * as AccountActions from "../actions/AccountActions"
import AccountType from "../AccountType"
import TruncatedAddress from "../components/CustomComponents/TruncatedAddress"
import {baseEthToWei, tokEthToWei} from "../EtherConversion"
import * as AccountApi from "../apis/AccountApi"
import Conditional from "./CustomComponents/Conditional"

export default class AccountDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = AccountStore.getAccountState()
        this.state.tooltipOpen = false
        this.state.currentGasPriceWei = GasPriceStore.getCurrentGasPriceWei()
        this.hideModal = this.hideModal.bind(this)
        this.onInputChange = this.onInputChange.bind(this)
        this.onAccountChange = this.onAccountChange.bind(this)
        this.toggle = this.toggle.bind(this)
        this.onGasStoreChange = this.onGasStoreChange.bind(this)
        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
        this.tokenAddress = TokenStore.getSelectedToken().address
    }

    componentDidMount() {
        AccountStore.on("change", this.onAccountChange)
        GasPriceStore.on("change", this.onGasStoreChange)
    }

    componentWillUnmount() {
        AccountStore.removeListener("change", this.onAccountChange)
        GasPriceStore.removeListener("change", this.onGasStoreChange)
    }

    onInputChange(event) {
        AccountActions.depositWithdrawAmountUpdated(event.target.value)
    }

    onAccountChange() {
        this.setState(AccountStore.getAccountState())
    }

    onGasStoreChange() {
        this.setState({
            currentGasPriceWei: GasPriceStore.getCurrentGasPriceWei()
        })
    }

    onTokenStoreChange() {
        this.setState((prevState, props) => ({
            tokenAddress: TokenStore.getSelectedToken().address,
        }))
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        })
    }

    hideModal() {
        AccountActions.depositWithdrawCancel()
    }

    refreshBalances = () => {
        const {account, accountRetrieved, tokenAddress, retrievingBalance} = this.state

        if (accountRetrieved && ! retrievingBalance) {
            AccountApi.refreshEthAndTokBalance(account, tokenAddress, true)
        }
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
            modalIsDeposit,
            currentGasPriceWei,
        } = this.state

        if (modalIsDeposit) {
            if (modalIsEth) {
                AccountApi.depositEth(
                    account,
                    accountRetrieved,
                    nonce,
                    token.address,
                    baseEthToWei(modalValue),
                    currentGasPriceWei)
            } else {
                AccountApi.depositTok(
                    account,
                    accountRetrieved,
                    nonce,
                    token.address,
                    tokEthToWei(modalValue, token.address),
                    currentGasPriceWei)
            }
        } else {
            if (modalIsEth) {
                AccountApi.withdrawEth(
                    account,
                    accountRetrieved,
                    nonce,
                    token.address,
                    baseEthToWei(modalValue),
                    currentGasPriceWei)
            } else {
                AccountApi.withdrawTok(
                    account,
                    accountRetrieved,
                    nonce,
                    token.address,
                    tokEthToWei(modalValue, token.address),
                    currentGasPriceWei)
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
            modalIsDeposit,
            balanceRetrieved,
            retrievingBalance,
            balanceRetrievalFailed
        } = this.state

        const modalToken = (modalIsEth ? "ETH" : token.name)
        const modalTitle = (modalIsDeposit ? `Deposit ${modalToken} to Exchange` : `Withdraw ${modalToken} from Exchange`)
        const modalActionLabel = (modalIsDeposit ? "Deposit" : "Withdraw")

        const accountTypeName = (selectedAccountType === AccountType.METAMASK ? "MetaMask" : "Wallet")
        let accountLink = <span className="text-danger">No account</span>
        if (accountRetrieved) {
            accountLink =
                <TruncatedAddress url={`${Config.getEtherscanUrl()}/address/${account}`}>{account}</TruncatedAddress>
        }

        let nonceTip = ''
        if (selectedAccountType !== AccountType.METAMASK) {
            let ntext = `Nonce: ${nonce}`
            nonceTip = <Tooltip placement="right" isOpen={this.state.tooltipOpen} target="atName"
                                toggle={this.toggle}>{ntext}</Tooltip>
        }

        const warningMessage = this.getAccountWarningMessage()
        const refreshDisabledClass = (accountRetrieved && ! retrievingBalance) ? "" : "disabled"

        return (
            <span>
                <div className="card">
                    <div className="card-header">
                        <div className="row hdr-stretch">
                            <div className="col-lg-6">
                                <strong className="card-title">Account</strong>
                            </div>
                            <div className="col-lg-6 red">
                                <div className="float-right">
                                    <button className={"btn btn-primary " + refreshDisabledClass}
                                            onClick={this.refreshBalances}><i
                                        className="fas fa-sync"/></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Conditional displayCondition={!balanceRetrieved}>
                        <BoxSection>
                            {warningMessage}
                        </BoxSection>
                    </Conditional>

                    <AccountTable
                        token={token}
                        walletBalanceEthWei={walletBalanceEthWei}
                        walletBalanceTokWei={walletBalanceTokWei}
                        exchangeBalanceEthWei={exchangeBalanceEthWei}
                        exchangeBalanceTokWei={exchangeBalanceTokWei}
                        ethTransaction={ethTransaction}
                        tokTransaction={tokTransaction}
                        accountsEnabled={balanceRetrieved}/>

                    <BoxFooter>
                        Account: {accountLink}
                        <br/>
                        <Badge id="atName" color="secondary">{accountTypeName}</Badge> {nonceTip}
                    </BoxFooter>
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

    getAccountWarningMessage() {
        const {retrievingBalance, balanceRetrievalFailed, accountRetrieved} = this.state

        if (retrievingBalance) {
            return "Checking balance"
        } else if (balanceRetrievalFailed) {
            return "There was a problem checking your balance"
        } else if (!accountRetrieved) {
            return "Please unlock a wallet to enable deposits and withdrawals"
        }

        return ""
    }
}