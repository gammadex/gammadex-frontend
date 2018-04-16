import * as GasActions from '../actions/GasActions'
import fetch from "fetch-polyfill"

let timer = null

export function retrieveGasPrices() {
    fetch('https://ethgasstation.info/json/ethgasAPI.json')
        .then(response => {
            if (response.status === 200) {
                return response.json()
            } else {
                throw new Error("Problem retrieving GAS prices")
            }
        })
        .then(json => {
            const {safeLow, average, fast, fastest} = json

            GasActions.gasPricesRetrieved(
                Math.round(safeLow / 10),
                Math.round(average / 10),
                Math.round(fast / 10),
                Math.round(fastest / 10),
                new Date())
        })
        .catch(error => {
            GasActions.gasPricesRetrieveError(error)
        })
}

export function startGasStationPollLoop(seconds = 120) {
    retrieveGasPrices()
    timer = window.setInterval(retrieveGasPrices, seconds * 1000);
}

export function stopGasStationPollLoop() {
    if (timer) {
        window.clearInterval(timer)
    }
}