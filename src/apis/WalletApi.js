import * as WalletActions from "../actions/WalletActions"
import * as EthereumNetworks from "../util/EthereumNetworks"
import WalletStore from "../stores/WalletStore"
import AccountStore from "../stores/AccountStore"
import Timer from "../util/Timer"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import * as AccountApi from "./AccountApi"
import AccountType from "../AccountType"
import _ from "lodash"
import * as GlobalMessageActions from "../actions/GlobalMessageActions"
import * as GlobalMessageFormatters from "../util/GlobalMessageFormatters"
import { Promise } from "es6-promise"

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

export function userPermissionForAccounts() {
    if (window.ethereum) {
        return window.ethereum.enable()
            .then(() => {
                return getAccount()
            })
    }

    return Promise.resolve()
}

function getAccount() {
    return new Promise((resolve, reject) => {
        window.web3.eth.getAccounts((e, accounts) => {
            if (accounts.length > 0) {
                WalletActions.updateProvidedWeb3AccountAvailable(true, accounts[0])
                if (AccountStore.getSelectedAccountType()
                    && AccountStore.getSelectedAccountType() === AccountType.METAMASK
                    && _.toLower(accounts[0]) !== _.toLower(AccountStore.getAccount())) {
                    EtherDeltaWeb3.initForMetaMask()
                    AccountApi.refreshAccountThenEthAndTokBalance(AccountType.METAMASK)
                }

                resolve()
            } else {
                if (WalletStore.isProvidedWeb3AccountAvailable() !== false) {
                    WalletActions.updateProvidedWeb3AccountAvailable(false)
                }

                reject()
            }
        })
    })
}

export function updateWalletStoreProvidedWeb3Details() {
    if (!window.web3) {
        if (WalletStore.isProvidedWeb3Available()) {
            WalletActions.updateProvidedWeb3Available(false)
        }
    } else {
        window.web3.version.getNetwork((err, netId) => {
            if(netId == null) {
                warnIfMetaMaskDisconnected()
                return
            }
            const isMainNet = EthereumNetworks.isMainNet(netId)
            const description = EthereumNetworks.getNetworkDescription(netId)
            const { isMainNet: currentIsMainNet, netDescription: currentNetDescription } = WalletStore.getProvidedWeb3Info()

            if (isMainNet !== currentIsMainNet || description !== currentNetDescription) {
                WalletActions.updateProvidedWeb3Net(isMainNet, description)
            }

            if (isMainNet) {
                closeMetamaskWarningMessageIfPresent()
                getAccount()
            } else {
                if (WalletStore.isProvidedWeb3AccountAvailable() !== false) {
                    WalletActions.updateProvidedWeb3AccountAvailable(null)
                    warnIfMetaMaskOnWrongNetwork()
                }
            }
        })
    }
}

function warnIfMetaMaskOnWrongNetwork() {
    if (!WalletStore.isMetamastNetworkWarningSentMessageId()) {
        const providedWeb3 = WalletStore.getProvidedWeb3Info()
        const { isMainNet, netDescription } = providedWeb3
        const mainNetDescription = EthereumNetworks.getMainNetDescription()

        if (netDescription && !isMainNet) {
            const message = GlobalMessageFormatters.metamaskNetworkWarning(netDescription, mainNetDescription)
            const messageId = GlobalMessageActions.sendGlobalMessage(message, "danger")
            WalletActions.metamaskNetworkWarningSent(messageId)
        }
    }
}

function warnIfMetaMaskDisconnected() {
    if (!WalletStore.isMetamastNetworkWarningSentMessageId()) {
        const message = GlobalMessageFormatters.metamaskDisconnectionWarning()
        const messageId = GlobalMessageActions.sendGlobalMessage(message, "danger")
        WalletActions.metamaskNetworkWarningSent(messageId)
    }
}

function closeMetamaskWarningMessageIfPresent() {
    const messageId = WalletStore.isMetamastNetworkWarningSentMessageId()

    if (!messageId) {
        GlobalMessageActions.closeGlobalMessage(messageId)
    }
}