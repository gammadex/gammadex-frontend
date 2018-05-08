import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import BigNumber from 'bignumber.js'

class GasPriceStore extends EventEmitter {
    constructor() {
        super()

        this.prices = []
        this.lastGasPriceRetrieveTime = null
        this.currentGasPriceWei = localStorage.currentGasPriceWei && localStorage.currentGasPriceWei !== "" ? BigNumber(localStorage.currentGasPriceWei) : null
    }

    getPrices() {
        return this.prices
    }

    getGasPriceLastRetrieveTime() {
        return this.lastGasPriceRetrieveTime
    }

    getCurrentGasPriceWei() {
        return this.currentGasPriceWei
    }

    getEthereumPriceUsd() {
        return this.ethereumPriceUsd
    }

    getEthereumPriceRetrieveTime() {
        return this.ethereumPriceRetrieveTime
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.GAS_PRICES_RETRIEVED: {
                const {time, ...prices} = action

                this.prices = prices
                this.lastGasPriceRetrieveTime = time

                if (!this.currentGasPriceWei) {
                    this.currentGasPriceWei = prices.averageWei
                }

                this.emitChange()
                break
            }
            case ActionNames.GAS_PRICES_SET_CURRENT_PRICE_WEI: {
                this.currentGasPriceWei = action.currentPriceWei
                localStorage.currentGasPriceWei = String(this.currentGasPriceWei)
                this.emitChange()
                break
            }
            case ActionNames.GAS_PRICES_RETRIEVE_ERROR: {
                break
            }
            case ActionNames.ETHEREUM_PRICE_RETRIEVED: {
                this.ethereumPriceUsd = action.ethereumPriceUsd
                this.ethereumPriceRetrieveTime = action.time
                this.emitChange()
                break
            }
            case ActionNames.ETHEREUM_PRICE_ERROR: {
                break
            }
            case ActionNames.GAS_PRICES_USE_RECOMMENDED: {
                this.currentGasPriceWei = this.prices.averageWei
                localStorage.currentGasPriceWei = ""
                this.emitChange()
                break
            }
        }
    }
}

const gasPriceStore = new GasPriceStore()
dispatcher.register(gasPriceStore.handleActions.bind(gasPriceStore))

export default gasPriceStore