import * as GasActions from '../actions/GasActions'
import {gweiToWei} from '../EtherConversion'

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
                gweiToWei(safeLow / 10),
                gweiToWei(average / 10),
                gweiToWei(fast / 10),
                gweiToWei(fastest / 10),
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