import React from "react"
import AccountStore from "../stores/AccountStore"
import BalancesStore from "../stores/BalancesStore"
import Download from "../components/CustomComponents/Download"
import * as WebSocketActions from "../actions/WebSocketActions"
import * as TokenBalancesActions from "../actions/TokenBalancesActions"
import RefreshButton from "../components/CustomComponents/RefreshButton"
import Scroll from "../components/CustomComponents/Scroll"
import {BoxTitle} from "../components/CustomComponents/Box"
import BalancesTable from "../components/Balances/BalancesTable"
import _ from 'lodash'
import BigNumber from 'bignumber.js'
import EmptyTableMessage from "../components/CustomComponents/EmptyTableMessage"
import {withRouter} from "react-router-dom"
import {withAnalytics} from '../util/Analytics'

class Balances extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            balances: BalancesStore.getBalances(),
            filter: "",
            account: AccountStore.getAccountState().account,
            refreshInProgress: BalancesStore.isRefreshInProgress(),
            sort: BalancesStore.getSort(),
            filterLowValueBalances: BalancesStore.isFilterLowValue(),
        }

        this.updateBalances = this.updateBalances.bind(this)
        this.updateAccount = this.updateAccount.bind(this)
    }

    componentWillMount() {
        BalancesStore.on("change", this.updateBalances)
        AccountStore.on("change", this.updateAccount)

        if (this.state.account) {
            WebSocketActions.getTokenBalances(this.state.account)
        }
    }

    componentWillUnmount() {
        BalancesStore.removeListener("change", this.updateBalances)
        AccountStore.removeListener("change", this.updateAccount)
    }

    componentDidUpdate(prevProps, prevState) {
        const prevAccount = prevState.account
        const account = this.state.account

        if (account && prevAccount !== account && !this.state.refreshInProgress) {
            setTimeout(() => WebSocketActions.getTokenBalances(this.state.account), 1)
        }
    }

    updateAccount() {
        this.setState({
            account: AccountStore.getAccountState().account
        })
    }

    updateBalances() {
        this.setState({
            balances: BalancesStore.getBalances(),
            refreshInProgress: BalancesStore.isRefreshInProgress(),
            sort: BalancesStore.getSort(),
            filterLowValueBalances: BalancesStore.isFilterLowValue(),
        })
    }

    refresh = () => {
        if (this.state.account && !this.state.refreshInProgress) {
            WebSocketActions.getTokenBalances(this.state.account)
        }
    }

    filterChanged = (event) => {
        const filter = event.target.value
        this.setState({filter})
    }

    handleHideLowValueTokens = (event) => {
        TokenBalancesActions.filterLowValueBalances(event.target.checked)
    }

    render() {
        const {account, refreshInProgress, sort, filterLowValueBalances} = this.state
        const filteredBalances = this.ensureEthTokenIsFirst(this.applyValueFiltering(this.getFilteredBalances()))
        const csvContent = this.toCsv(filteredBalances)
        const disabledClass = (!filteredBalances || filteredBalances.length === 0) ? 'disabled' : ''
        let content = this.getTableContent(filteredBalances)

        return (
            <div id="all-balances-container" className="all-balances-component">
                <div className="card">
                    <div className="card-header">
                        <BoxTitle title="My Token Balances"
                                  componentId="all-balances-container"
                        />

                        <div className="custom-control custom-checkbox my-1 mr-lg-2 no-mobile">
                            <input type="checkbox"
                                   className="custom-control-input"
                                   id="hideLowValueTokensCheckbox"
                                   onChange={this.handleHideLowValueTokens}
                                   value="true"
                                   checked={filterLowValueBalances}
                            />
                            <label className="custom-control-label center-label" htmlFor="hideLowValueTokensCheckbox">Hide low balances</label>
                        </div>

                        <div className="form-inline all-balances-search">
                            <input placeholder="Search" className={"form-control mr-2 " + disabledClass}
                                   onChange={this.filterChanged}/>
                            <Download fileName="balances.csv" contents={csvContent} mimeType="text/csv"
                                      className={"btn btn-primary btn-sm mr-2 " + disabledClass}><i
                                className="fas fa-download"/></Download>
                            <RefreshButton onClick={this.refresh}
                                           updating={refreshInProgress}
                                           disabled={!account || refreshInProgress}/>
                        </div>
                    </div>
                    <Scroll>
                        {content}
                    </Scroll>
                </div>
            </div>
        )
    }

    getTableContent(filteredBalances) {
        const {account, refreshInProgress, sort, balances} = this.state

        let content = <EmptyTableMessage>You have no token balances</EmptyTableMessage>
        if (balances.length === 0 && refreshInProgress) {
            content = <EmptyTableMessage>Checking token balances</EmptyTableMessage>
        }
        if (!account) {
            content = <EmptyTableMessage>Please unlock a wallet to see your token balances</EmptyTableMessage>
        } else if (balances && balances.length > 0) {
            content = <BalancesTable balances={filteredBalances} sort={sort}/>
        }

        return content
    }

    getFilteredBalances() {
        const {balances, filter} = this.state

        if (filter && filter.length > 0) {
            return balances.filter(b => {
                const row = _.join(_.values(b.token), '::::').toLowerCase()
                const keep = row.includes(filter.toLowerCase())

                return keep
            })
        } else {
            return balances
        }
    }

    toCsv(balances) {
        const header = ["Token Symbol", "Token Name", "Wallet Balance", "Wallet Balance ETH", "Wallet Balance USD",
            "Exchange Balance", "Exchange Balance ETH", "Exchange Balance USD", "Token Address"].join(",")

        const content = balances.map(b => {
            return [
                b.token.symbol,
                b.token.name,
                b.walletBalance,
                b.walletBalanceEth,
                b.walletBalanceUsd,
                b.exchangeBalance,
                b.exchangeBalanceEth,
                b.exchangeBalanceUsd,
                b.token.address
            ].map(x => {
                if (_.isString(x)) {
                    return x.replace(",", "")
                } else {
                    return x
                }
            }).join(",")
        })

        return [header, ...content].join("\r\n")
    }

    applyValueFiltering(balances) {
        const ethThreshold = new BigNumber("0.001")

        const {filterLowValueBalances} = this.state

        return balances.filter(b => {
            const showAllBalances = (!filterLowValueBalances)
            const largeWalletBalance = new BigNumber(String(b.walletBalanceEth || "0")).isGreaterThan(ethThreshold)
            const largeExchangeBalance = new BigNumber(String(b.exchangeBalanceEth || "0")).isGreaterThan(ethThreshold)

            return showAllBalances || largeWalletBalance || largeExchangeBalance
        })
    }

    ensureEthTokenIsFirst(balances) {
        let eth = balances.filter(b => b.token.address === '0x0000000000000000000000000000000000000000')
        if (balances.length > 0 && eth.length === 0) {
            eth = [{
                token: {
                    symbol: 'ETH',
                    name: 'Ethereum',
                    address: null
                },
                walletBalance: 0,
                exchangeBalance: 0
            }]
        }

        const nonEth = balances.filter(b => b.token.address !== '0x0000000000000000000000000000000000000000')

        return [...eth, ...nonEth]
    }
}

export default withAnalytics(withRouter(Balances))