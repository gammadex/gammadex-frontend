import Config from '../Config'

const networks = {
    1: "mainnet",
    2: "testnet (Morden)",
    3: "testnet (Ropsten)",
    4: "testnet (Rinkeby)",
    42: "testnet (Kovan)",
}

export function getNetworkDescription(netId) {
    netId = parseInt(netId, 10)

    if (networks[netId]) {
        return networks[netId]
    } else {
        return "Unknown"
    }
}

export function isMainNet(netId) {
    const id = parseInt(netId, 10)

    return id === Config.getEthereumNetworkId()
}

export function getMainNetDescription() {
    return getNetworkDescription(Config.getEthereumNetworkId())
}