import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import TokenBalanceSort from "../TokenBalanceSort"
import _ from 'lodash'
import {filterLowValueBalances} from "../actions/TokenBalancesActions"
import * as FavouritesDao from "../util/FavouritesDao"

class BalancesStore extends EventEmitter {
    constructor() {
        super()
        this._clearState()
        this.getBalances = this.getBalances.bind(this)
        this.isRefreshInProgress = this.isRefreshInProgress.bind(this)
        this.getLastUpdateTime = this.getLastUpdateTime.bind(this)
        this.sortBalances = this.sortBalances.bind(this)
        this.updateBalancesWithPrices = this.updateBalancesWithPrices.bind(this)
        this.sortColumn = TokenBalanceSort.SYMBOL
        this.sortOrder = TokenBalanceSort.SYMBOL
        this.ethereumPriceUsd = null
        this.filterLowValue = FavouritesDao.getFavourite('filterLowValueBalances', true)
    }

    _clearState() {
        this.refreshInProgress = false
        this.balances = []
        this.lastUpdateTime = null
    }

    getBalances() {
        return this.balances
    }

    isRefreshInProgress() {
        return this.refreshInProgress
    }

    getLastUpdateTime() {
        return this.lastUpdateTime
    }

    getSort() {
        return [this.sortColumn, this.sortOrder]
    }

    isFilterLowValue() {
        return this.filterLowValue
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.MESSAGE_REQUESTED_TOKEN_BALANCES: {
                this.refreshInProgress = true
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_TOKEN_BALANCES: {
                this._clearState()
                this.refreshInProgress = false
                if (action.balances && action.balances.balances) {
                    this.balances = this.updateBalancesWithPrices(action.balances.balances)
                    this.sortBalances()
                    this.lastUpdateTime = new Date().getTime()
                    this.emitChange()
                }
                break
            }
            case ActionNames.TOKEN_BALANCES_RETRIEVAL_FAILED: {
                this._clearState()
                this.emitChange()
                break
            }
            case ActionNames.WEB_SOCKET_CLOSED: {
                this.refreshInProgress = false
                this.emitChange()
                break
            }
            case ActionNames.WEB_SOCKET_ERROR: {
                this.refreshInProgress = false
                this.emitChange()
                break
            }
            case ActionNames.WALLET_LOGOUT: {
                this._clearState()
                this.emitChange()
                break
            }
            case ActionNames.ETHEREUM_PRICE_RETRIEVED: {
                if (action.ethereumPriceUsd) {
                    this.ethereumPriceUsd = action.ethereumPriceUsd
                }
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_BALANCE_SORT: {
                this.sortColumn = action.sortColumn
                this.sortOrder = action.sortOrder
                this.sortBalances()
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_BALANCE_FILTER_LOW_VALUE: {
                this.filterLowValue = action.filterLowValue
                FavouritesDao.setFavourite('filterLowValueBalances', action.filterLowValue)
                this.emitChange()
                break
            }
        }
    }

    updateBalancesWithPrices(balances) {
        return balances.map(b => {
            if (b.lastPrice) {
                const walletBalanceEth = b.lastPrice * b.walletBalance
                const walletBalanceUsd = (walletBalanceEth && this.ethereumPriceUsd) ? walletBalanceEth * this.ethereumPriceUsd : null
                const exchangeBalanceEth = b.lastPrice * b.exchangeBalance
                const exchangeBalanceUsd = (b.exchangeBalance && this.ethereumPriceUsd) ? exchangeBalanceEth * this.ethereumPriceUsd : null

                return Object.assign({}, b, {
                    walletBalanceEth,
                    walletBalanceUsd,
                    exchangeBalanceEth,
                    exchangeBalanceUsd
                })
            } else {
                return b
            }
        })
    }

    sortBalances() {
        let sortedBalances = this.balances || []
        if (this.sortColumn) {
            sortedBalances = _.sortBy(sortedBalances, this.sortColumn)
            if (this.sortOrder === 'desc') {
                sortedBalances = _.reverse(sortedBalances)
            }
        }

        this.balances = sortedBalances
    }
}

const balancesStore = new BalancesStore()
dispatcher.register(balancesStore.handleActions.bind(balancesStore))

export default balancesStore