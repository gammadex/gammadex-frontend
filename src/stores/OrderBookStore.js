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
        this.currentBlockNumber = null
    }

    getBids() {
        return this.bids
    }

    getBidsDescending(){
        return _.reverse(_.sortBy(this.bids, o => Number(o.price)))
    }

    getBidTotal() {
        return _.reduce(this.bids.map(b => b.availableVolume), (sum, n) => BigNumber(sum).plus(BigNumber(n)), 0)
    }

    getOffers() {
        return this.offers
    }

    getOffersDescending(){
        return _.reverse(_.sortBy(this.offers, o => Number(o.price)))
    }

    getAllTradesSortedByDateAsc() {
        return _.reverse(this.trades.slice())
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
            case ActionNames.CURRENT_BLOCK_NUMBER_UPDATED: {
                this.currentBlockNumber = action.currentBlockNumber
                this.bids = this.bids.filter(bid => this.currentBlockNumber && Number(bid.expires) > this.currentBlockNumber)
                this.offers = this.offers.filter(offer => this.currentBlockNumber && Number(offer.expires) > this.currentBlockNumber)
                this.emitChange()
                break
            }
            case ActionNames.UNRECOGNISED_TOKEN: {
                this.clearState()
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
            const tokenAddress = TokenStore.getSelectedTokenAddress()

            if (message.buys) {
                this.bids = OrderMerger.mergeOrders(this.bids, message.buys, tokenAddress, false)
            }
            if (message.sells) {
                this.offers = OrderMerger.mergeOrders(this.offers, message.sells, tokenAddress, true)
            }
        }
    }

    mergeTrades(message) {
        if (message) {
            this.trades = TradesMerger.mergeAndSortTrades(this.trades, message, TokenStore.getSelectedTokenAddress())
            this.tradeStats = TradeStatsExtractor.extractStats(this.trades, new Date().addDays(-1))
        }
    }
}

const orderBookStore = new OrderBookStore()
dispatcher.register(orderBookStore.handleActions.bind(orderBookStore))

export default orderBookStore