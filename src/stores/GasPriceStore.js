import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

class GasPriceStore extends EventEmitter {
    constructor() {
        super()

        this.prices = []
        this.lastRetrieveTime = null
        this.currentGasPriceWei = null
    }

    getPrices() {
        return this.prices
    }

    getLastRetrieveTime() {
        return this.lastRetrieveTime
    }

    getCurrentGasPriceWei() {
        return this.currentGasPriceWei
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.GAS_PRICES_RETRIEVED: {
                const {time, ...prices} = action

                this.prices = prices
                this.lastRetrieveTime = time

                if (! this.currentGasPriceWei) {
                    this.currentGasPriceWei = prices.averageWei
                }

                this.emitChange()
                break
            }
            case ActionNames.GAS_PRICES_SET_CURRENT_PRICE_WEI: {
                this.currentGasPriceWei = action.currentPriceWei
                this.emitChange()
                break
            }
            case ActionNames.GAS_PRICES_RETRIEVE_ERROR: {
                //this.emitChange()
                break
            }
        }
    }
}

const gasPriceStore = new GasPriceStore()
dispatcher.register(gasPriceStore.handleActions.bind(gasPriceStore))

export default gasPriceStore