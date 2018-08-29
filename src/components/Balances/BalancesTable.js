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
                        {this.sorter("Token Symbol", TokenBalanceSort.SYMBOL)}
                        {this.sorter("Token Name", TokenBalanceSort.NAME)}
                        {this.sorter("Wallet Balance", TokenBalanceSort.WALLET_BALANCE)}
                        {this.sorter("ETH", TokenBalanceSort.WALLET_BALANCE_ETH)}
                        {this.sorter("USD", TokenBalanceSort.WALLET_BALANCE_USD)}
                        {this.sorter("Exchange Balance", TokenBalanceSort.EXCHANGE)}
                        {this.sorter("ETH", TokenBalanceSort.EXCHANGE_ETH)}
                        {this.sorter("USD", TokenBalanceSort.EXCHANGE_USD)}
                        {this.sorter("Token Address", TokenBalanceSort.TOKEN_ADDRESS)}
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            </div>
        )
    }

    sorter = (colText, column) => {
        const {sort} = this.props
        const [sortColumn, sortOrder] = sort

        const sortClass = sortColumn === column ? (sortOrder === "asc" ? "fas fa-sort-up" : "fas fa-sort-down") : "fas fa-sort"
        const onClickOrder = (sortColumn === column && sortOrder === "asc") ? "desc" : "asc"
        const sortFunc = () => this.onSort(column, onClickOrder)

        return <th><span className="clickable" onClick={sortFunc}>{colText} </span><span className={"clickable " + sortClass} onClick={sortFunc}/></th>
    }
}