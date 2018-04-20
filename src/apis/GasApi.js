import * as GasActions from '../actions/GasActions'
import {gweiToWei} from '../EtherConversion'

let etherGasStationTimer = null
let coinMarketCapTimer = null

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
    etherGasStationTimer = window.setInterval(retrieveGasPrices, seconds * 1000);
}

export function stopGasStationPollLoop() {
    if (etherGasStationTimer) {
        window.clearInterval(etherGasStationTimer)
    }
}

export function retrieveEthereumPrice() {
    fetch('https://api.coinmarketcap.com/v1/ticker/ethereum/')
        .then(response => {
            if (response.status === 200) {
                return response.json()
            } else {
                throw new Error("Problem retrieving Ethereum price")
            }
        })
        .then(json => {
            const priceUsd = json[0]['price_usd']

            GasActions.ethereumPriceRetrieved(priceUsd, new Date())
        })
        .catch(error => {
            GasActions.ethereumPriceRetrieveError(error)
        })
}

export function startCoinMarketCapPollLoop(seconds = 120) {
    retrieveEthereumPrice()
    coinMarketCapTimer = window.setInterval(retrieveEthereumPrice, seconds * 1000);
}

export function stopCoinMarketCapPollLoop() {
    if (coinMarketCapTimer) {
        window.clearInterval(coinMarketCapTimer)
    }
}