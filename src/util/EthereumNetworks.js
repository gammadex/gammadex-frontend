import Config from '../Config'

const networks = {
    1: "main network",
    2: "Morden test network",
    3: "Ropsten test network",
    4: "Rinkeby test network",
    42: "Kovan test network",
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