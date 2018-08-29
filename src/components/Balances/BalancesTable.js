import React from "react"
import BalancesRow from "./BalancesRow"
import * as TokenBalancesActions from "../../actions/TokenBalancesActions"
import TokenBalanceSort from '../../TokenBalanceSort'
import TokenChooserSort from "../TokenChooser/TokenChooserSort"

export default class BalancesTable extends React.Component {

    constructor(props) {
        super(props)
        this.onSort = this.onSort.bind(this)
    }

    onSort(column, order) {
        TokenBalancesActions.tokenBalancesSort(column, order)
    }

    render() {
        const {balances, refreshInProgress} = this.props

        const rows = balances.map((balance) => {
            return <BalancesRow
                key={balance.token.address}
                balance={balance}
                refreshInProgress={refreshInProgress}/>
        })

        return (
            <div className="table-responsive my-trades-history">
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>Token symbol {this.sorter(TokenBalanceSort.SYMBOL)}</th>
                        <th>Token name {this.sorter(TokenBalanceSort.NAME)}</th>
                        <th>Wallet balance {this.sorter(TokenBalanceSort.WALLET_BALANCE)}</th>
                        <th>ETH {this.sorter(TokenBalanceSort.WALLET_BALANCE_ETH)}</th>
                        <th>USD {this.sorter(TokenBalanceSort.WALLET_BALANCE_USD)}</th>
                        <th>Exchange balance {this.sorter(TokenBalanceSort.EXCHANGE)}</th>
                        <th>ETH {this.sorter(TokenBalanceSort.EXCHANGE_ETH)}</th>
                        <th>USD {this.sorter(TokenBalanceSort.EXCHANGE_USD)}</th>
                        <th>Token address {this.sorter(TokenBalanceSort.TOKEN_ADDRESS)}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            </div>
        )
    }

    sorter = (column) => {
        const {sort} = this.props
        const [sortColumn, sortOrder] = sort

        const sortClass = sortColumn === column ? (sortOrder === "asc" ? "fas fa-sort-up" : "fas fa-sort-down") : "fas fa-sort"
        const onClickOrder = (sortColumn === column && sortOrder === "asc") ? "desc" : "asc"

        return <span className={"clickable " + sortClass} onClick={() => this.onSort(column, onClickOrder)}/>
    }
}