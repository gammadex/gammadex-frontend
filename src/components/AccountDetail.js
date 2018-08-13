import React from "react"
import TokenStore from '../stores/TokenStore'
import AccountStore from '../stores/AccountStore'
import GasPriceStore from '../stores/GasPriceStore'
import Funding from '../components/Account/Funding'
import {Box, BoxFooter, BoxSection, BoxTitle} from "./CustomComponents/Box"
import {baseEthToWei, tokEthToWei, baseWeiToEth, tokWeiToEth} from "../EtherConversion"
import * as AccountApi from "../apis/AccountApi"
import Conditional from "./CustomComponents/Conditional"
import RefreshButton from "./CustomComponents/RefreshButton"
import TokenRepository from "../util/TokenRepository"

export default class AccountDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = AccountStore.getAccountState()
        this.state.currentGasPriceWei = GasPriceStore.getCurrentGasPriceWei()
        this.onAccountChange = this.onAccountChange.bind(this)
        this.onGasStoreChange = this.onGasStoreChange.bind(this)
        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
        this.tokenAddress = TokenStore.getSelectedTokenAddress()
        this.tokenSymbol = TokenStore.getSelectedTokenSymbol()
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
        this.setState({
            tokenAddress: TokenStore.getSelectedTokenAddress(),
            tokenSymbol: TokenStore.getSelectedTokenSymbol()
        })
    }

    refreshBalances = () => {
        const {account, accountRetrieved, tokenAddress, retrievingBalance} = this.state

        if (tokenAddress && accountRetrieved && !retrievingBalance) {
            AccountApi.refreshEthAndTokBalance(account, tokenAddress, true)
        }
    }

    render() {
        const {token} = this.props
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
            tokenAddress,
            tokenSymbol,
        } = this.state

        const warningMessage = this.getAccountWarningMessage()

        let walletBalanceEth = null
        let exchangeBalanceEth = null
        let walletBalanceTok = null
        let exchangeBalanceTok = null
        if (tokenAddress && retrievedTokenAddress && tokenAddress === retrievedTokenAddress && TokenRepository.tokenExists(tokenAddress)) {
            walletBalanceEth = baseWeiToEth(walletBalanceEthWei).toString()
            exchangeBalanceEth = baseWeiToEth(exchangeBalanceEthWei).toString()
            walletBalanceTok = tokWeiToEth(walletBalanceTokWei, tokenAddress).toString()
            exchangeBalanceTok = tokWeiToEth(exchangeBalanceTokWei, tokenAddress).toString()
        }

        return (
            <div id="balances-container" className="card balances-component">
                <div className="card-header with-button">
                    <BoxTitle title="Balances"
                              ids={{'balance-body':'block', 'balances-refresh': 'block'}}
                    />

                    <div id="balances-refresh" className="mobile-toggle">
                        <RefreshButton onClick={this.refreshBalances}
                                       disabled={!accountRetrieved || retrievingBalance}
                                       updating={retrievingBalance}/>
                    </div>
                </div>

                <Funding tokenName={tokenSymbol}
                         walletBalanceEth={walletBalanceEth}
                         exchangeBalanceEth={exchangeBalanceEth}
                         walletBalanceTok={walletBalanceTok}
                         exchangeBalanceTok={exchangeBalanceTok}/>
            </div>
        )
    }

    getAccountWarningMessage() {
        const {retrievingBalance, balanceRetrievalFailed, accountRetrieved} = this.state

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