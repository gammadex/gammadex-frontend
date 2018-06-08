import React from "react"
import TokenStore from '../stores/TokenStore'
import AccountStore from '../stores/AccountStore'
import GasPriceStore from '../stores/GasPriceStore'
import Funding from '../components/Account/Funding'

import Config from '../Config'
import { Badge, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip } from 'reactstrap'
import { Box, BoxFooter, BoxSection } from "./CustomComponents/Box"

import * as AccountActions from "../actions/AccountActions"
import * as OrderPlacementActions from "../actions/OrderPlacementActions"
import * as FundingActions from "../actions/FundingActions"
import AccountType from "../AccountType"
import TruncatedAddress from "../components/CustomComponents/TruncatedAddress"
import { baseEthToWei, tokEthToWei, baseWeiToEth, tokWeiToEth } from "../EtherConversion"
import * as AccountApi from "../apis/AccountApi"
import Conditional from "./CustomComponents/Conditional"
import RefreshButton from "./CustomComponents/RefreshButton"
import Round from "./CustomComponents/Round"

export default class AccountDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = AccountStore.getAccountState()
        this.state.currentGasPriceWei = GasPriceStore.getCurrentGasPriceWei()
        this.onAccountChange = this.onAccountChange.bind(this)
        this.onGasStoreChange = this.onGasStoreChange.bind(this)
        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
        this.tokenAddress = TokenStore.getSelectedToken().address
    }

    componentDidMount() {
        AccountStore.on("change", this.onAccountChange)
        GasPriceStore.on("change", this.onGasStoreChange)
        TokenStore.on("change", this.onTokenStoreChange)
        this.onTokenStoreChange()
    }

    componentWillUnmount() {
        AccountStore.removeListener("change", this.onAccountChange)
        GasPriceStore.removeListener("change", this.onGasStoreChange)
        TokenStore.removeListener("change", this.onTokenStoreChange)
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

    refreshBalances = () => {
        const { account, accountRetrieved, tokenAddress, retrievingBalance } = this.state

        if (accountRetrieved && !retrievingBalance) {
            AccountApi.refreshEthAndTokBalance(account, tokenAddress, true)
        }
    }

    render() {
        const { token } = this.props
        const {
            accountRetrieved,
            walletBalanceEthWei,
            walletBalanceTokWei,
            exchangeBalanceEthWei,
            exchangeBalanceTokWei,
            balanceRetrieved,
            retrievingBalance,
            balanceRetrievalFailed,
            retrievedTokenAddress,
            tokenAddress
        } = this.state

        const clearBalances = !tokenAddress || !retrievedTokenAddress || tokenAddress != retrievedTokenAddress
        const warningMessage = this.getAccountWarningMessage()

        let walletBalanceEth = null
        let exchangeBalanceEth = null
        let walletBalanceTok = null
        let exchangeBalanceTok = null
        if (!clearBalances) {
            walletBalanceEth = baseWeiToEth(walletBalanceEthWei).toString()
            exchangeBalanceEth = baseWeiToEth(exchangeBalanceEthWei).toString()
            walletBalanceTok = tokWeiToEth(walletBalanceTokWei, tokenAddress).toString()
            exchangeBalanceTok = tokWeiToEth(exchangeBalanceTokWei, tokenAddress).toString()
        }

        return (
            <span>
                <div className="card">
                    <div className="card-header">
                        <div className="row hdr-stretch">
                            <div className="col-lg-6">
                                <strong className="card-title">Balances</strong>
                            </div>
                            <div className="col-lg-6">
                                <div className="float-right">
                                    <RefreshButton onClick={this.refreshBalances}
                                        disabled={!accountRetrieved || retrievingBalance}
                                        updating={retrievingBalance} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Conditional displayCondition={!balanceRetrieved && !!warningMessage}>
                        <BoxSection>
                            {warningMessage}
                        </BoxSection>
                    </Conditional>

                    <Funding tokenName={token.symbol}
                        walletBalanceEth={walletBalanceEth}
                        exchangeBalanceEth={exchangeBalanceEth}
                        walletBalanceTok={walletBalanceTok}
                        exchangeBalanceTok={exchangeBalanceTok} />
                </div>
            </span>
        )
    }

    getAccountWarningMessage() {
        const { retrievingBalance, balanceRetrievalFailed, accountRetrieved } = this.state

        if (retrievingBalance) {
            return null
        } else if (balanceRetrievalFailed) {
            return "There was a problem checking your balance"
        } else if (!accountRetrieved) {
            return "Please unlock a wallet to enable deposits and withdrawals"
        }

        return ""
    }
}