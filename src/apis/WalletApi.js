import * as WalletActions from "../actions/WalletActions"
import * as EthereumNetworks from "../util/EthereumNetworks"
import WalletStore from "../stores/WalletStore"
import Timer from "../util/Timer"

/**
 * Poll for MetaMask login / logout - nasty but current best practice
 *
 * https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#ear-listening-for-selected-account-changes
 */
export function startMetaMaskCheckLoop(ms = 2000) {
    updateWalletStoreProvidedWeb3Details()
    Timer.start(updateWalletStoreProvidedWeb3Details, ms)
}

export function stopMetaMaskCheckLoop() {
    Timer.stop(updateWalletStoreProvidedWeb3Details)
}

export function updateWalletStoreProvidedWeb3Details() {
    if (!window.web3) {
        if (WalletStore.isProvidedWeb3Available()) {
            WalletActions.updateProvidedWeb3Available(false)
        }
    } else {
        window.web3.version.getNetwork((err, netId) => {
            const isMainNet = EthereumNetworks.isMainNet(netId)
            const description = EthereumNetworks.getNetworkDescription(netId)
            const {isMainNet: currentIsMainNet, netDescription: currentNetDescription} = WalletStore.getProvidedWeb3Info()

            if (isMainNet !== currentIsMainNet || description !== currentNetDescription) {
                WalletActions.updateProvidedWeb3Net(isMainNet, description)
            }

            if (isMainNet) {
                window.web3.eth.getAccounts((e, accounts) => {
                    if (accounts.length > 0) {
                        if (!WalletStore.isProvidedWeb3AccountAvailable()) {
                            WalletActions.updateProvidedWeb3AccountAvailable(true)
                        }
                    } else {
                        if (WalletStore.isProvidedWeb3AccountAvailable() !== false) {
                            WalletActions.updateProvidedWeb3AccountAvailable(false)
                        }
                    }
                })
            } else {
                if (WalletStore.isProvidedWeb3AccountAvailable() !== false) {
                    WalletActions.updateProvidedWeb3AccountAvailable(null)
                }
            }
        })
    }
}