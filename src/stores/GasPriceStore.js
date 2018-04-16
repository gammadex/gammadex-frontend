import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"

class GasPriceStore extends EventEmitter {
    constructor() {
        super()

        this.prices = []
        this.lastRetrieveTime = null
        this.currentGasPriceGwei = null
    }

    getPrices() {
        return this.prices
    }

    getLastRetrieveTime() {
        return this.lastRetrieveTime
    }

    getCurrentGasPriceGwei() {
        return this.currentGasPriceGwei
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

                if (! this.currentGasPriceGwei) {
                    this.currentGasPriceGwei = prices.average
                }

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