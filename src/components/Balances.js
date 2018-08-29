import React from "react"
import AccountStore from "../stores/AccountStore"
import BalancesStore from "../stores/BalancesStore"
import Download from "./CustomComponents/Download"
import * as WebSocketActions from "../actions/WebSocketActions"
import RefreshButton from "./CustomComponents/RefreshButton"
import Scroll from "./CustomComponents/Scroll"
import {BoxTitle} from "./CustomComponents/Box"
import BalancesTable from "./Balances/BalancesTable"
import _ from 'lodash'

export default class Balances extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            balances: BalancesStore.getBalances(),
            filter: "",
            account: AccountStore.getAccountState().account,
            refreshInProgress: BalancesStore.isRefreshInProgress(),
            sort: BalancesStore.getSort(),
        }

        this.updateBalances = this.updateBalances.bind(this)
        this.updateAccount = this.updateAccount.bind(this)
    }

    componentWillMount() {
        BalancesStore.on("change", this.updateBalances)
        AccountStore.on("change", this.updateAccount)
    }

    componentWillUnmount() {
        BalancesStore.removeListener("change", this.updateBalances)
        AccountStore.removeListener("change", this.updateAccount)
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

    render() {
        const {account, refreshInProgress, sort} = this.state
        const filteredBalances = this.getFilteredBalances()
        const csvContent = this.toCsv(filteredBalances)
        const disabledClass = (!filteredBalances || filteredBalances.length === 0) ? 'disabled' : ''

        return (
            <div id="all-balances-container" className="all-balances-component">
                <div className="card">
                    <div className="card-header">
                        <BoxTitle title="My Token Balances"
                                  componentId="all-balances-container"
                        />

                        <div className="form-inline all-balances-search">
                            <input placeholder="Search" className={"form-control  mr-2 " + disabledClass}
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
                        <BalancesTable balances={filteredBalances} sort={sort}/>
                    </Scroll>
                </div>
            </div>
        )
    }

    getFilteredBalances() {
        const {balances, filter} = this.state

        if (filter && filter.length > 0) {
            return balances.filter(b => {
                const row = _.join(_.values(b.token), '::::')
                const keep = row.includes(filter)

                return keep
            })
        } else {
            return balances
        }
    }

    toCsv(balances) {
        const header = ["Token Symbol", "Token Name", "Wallet Balance","Wallet Balance ETH","Wallet Balance USD",
            "Exchange Balance","Exchange Balance ETH","Exchange Balance USD","Token Address" ].join(",")

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

}