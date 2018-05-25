import {EventEmitter} from "events"
import * as OrderMerger from './util/OrderMerger'
import * as TradesMerger from './util/TradesMerger'
import _ from "lodash"
import * as TradeStatsExtractor from '../util/TradeStatsExtractor'
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import TokenStore from '../stores/TokenStore'
import BigNumber from 'bignumber.js'
import datejs from 'datejs'

class OrderBookStore extends EventEmitter {
    constructor() {
        super()
        this.clearState()
    }

    getBids() {
        return this.bids
    }

    getBidTotal() {
        return _.reduce(this.bids.map(b => b.availableVolume), (sum, n) => BigNumber(sum).plus(BigNumber(n)), 0)
    }

    getOffers() {
        return this.offers
    }

    getAllTradesSortedByDateAsc() {
        return _.reverse(this.trades.slice()) // TODO _.reverse seems to sort in place?
    }

    getTrades() {
        return this.trades
    }

    getTradeStats() {
        return this.tradeStats
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.WEB_SOCKET_OPENED: {
                this.clearState()
                this.emitChange()
                break
            }
            case ActionNames.SELECT_TOKEN: {
                this.clearState()
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_MARKET: {
                this.storeBidsOffersAndTrades(action.message)
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_ORDERS: {
                this.mergeBuysAndSells(action.message)
                this.emitChange()
                break
            }
            case ActionNames.MESSAGE_RECEIVED_TRADES: {
                this.mergeTrades(action.trades)
                this.emitChange()
                break
            }            
        }
    }

    clearState() {
        this.bids = []
        this.offers = []
        this.trades = []
        this.tradeStats = {
            low: null, high: null, token_vol: null, eth_vol: null, last: null, change: null, tokenAddress: null
        }
    }

    storeBidsOffersAndTrades(message) {
        this.bids = []
        this.offers = []
        this.trades = []

        if (message.trades) {
            this.trades = TradesMerger.sortByTimeAndIdRemovingDuplicates(message.trades)
            this.tradeStats = TradeStatsExtractor.extractStats(this.trades, new Date().addDays(-1))
        }

        if (message && message.orders) {
            const orders = message.orders

            if (orders.buys) {
                window.buys = orders.buys
                this.bids = OrderMerger.sortByPriceAndIdRemovingDuplicates(orders.buys, false)
            }
            if (orders.sells) {
                window.sells = orders.sells
                this.offers = OrderMerger.sortByPriceAndIdRemovingDuplicates(orders.sells, true)
            }
        }
    }

    mergeBuysAndSells(message) {
        if (message) {
            const token = TokenStore.getSelectedToken() // TODO - is it acceptable that this has to know about TokenStore?

            if (message.buys) {
                this.bids = OrderMerger.mergeOrders(this.bids, message.buys, token.address, false)
            }
            if (message.sells) {
                this.offers = OrderMerger.mergeOrders(this.offers, message.sells, token.address, true)
            }
        }
    }

    mergeTrades(message) {
        if (message) {
            this.trades = TradesMerger.mergeAndSortTrades(this.trades, message, TokenStore.getSelectedToken().address)
            this.tradeStats = TradeStatsExtractor.extractStats(this.trades, new Date().addDays(-1))
        }
    }
}

const orderBookStore = new OrderBookStore()
dispatcher.register(orderBookStore.handleActions.bind(orderBookStore))

export default orderBookStore