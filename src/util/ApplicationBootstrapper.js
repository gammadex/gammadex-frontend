import AccountType from "../AccountType"
import * as WalletDao from "../util/WalletDao"
import * as KeyUtil from "../util/KeyUtil"
import * as AccountActions from "../actions/AccountActions"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import * as AccountApi from "../apis/AccountApi"

// TODO - this hacky poo will go away when app wallet / account / web3 bootstrapping gets cleaned up

export function initAccounts() {
    const {address, privateKey} = getUnsecuredPrivateKeyAccount()

    if (address) {
        EtherDeltaWeb3.initForPrivateKey(address, privateKey)
        AccountApi.refreshAccount(AccountType.PRIVATE_KEY)
    } else if (typeof web3 !== "undefined") { // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        EtherDeltaWeb3.initForMetaMask()
        AccountApi.refreshAccount(AccountType.METAMASK)
    }
}

function getUnsecuredPrivateKeyAccount() {
    if (WalletDao.isWalletSaved(AccountType.PRIVATE_KEY)) {
        const wallet = WalletDao.readWallet()

        if (!wallet.data.encrypted) {
            const privateKey = wallet.data.key
            const {address} = KeyUtil.convertPrivateKeyToAddress(privateKey)

            return {privateKey, address}
        }
    }

    return {privateKey: null, address: null}
}
