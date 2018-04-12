import * as LedgerUtil from "../util/LedgerUtil"
import * as WalletActions from "../actions/WalletActions"
import Config from '../Config'
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import * as AccountActions from "../actions/AccountActions"
import * as WalletDao from "../util/WalletDao"
import AccountType from "../AccountType"

export function requestAddresses(deriviationPath, page) {
    const web3 = LedgerUtil.getLedgerWeb3(deriviationPath, Config.getWeb3Url(), Config.getEthereumNetworkId())

    WalletActions.ledgerAccountsRequested(deriviationPath)

    web3.eth.getAccounts()
        .then(accounts => {
            console.log("Accounts", accounts)
            WalletActions.ledgerAccountsRetrieved(accounts, page)
        })
        .catch(err => {
            console.log("Error", err)
            WalletActions.ledgerError(err.message, err.name)
        })
}

export function initAccount(deriviationPath, accountIndex, history) {
    const web3 = LedgerUtil.getLedgerWeb3(deriviationPath, Config.getWeb3Url(), Config.getEthereumNetworkId())

    EtherDeltaWeb3.initForLedger(web3, accountIndex)
    AccountActions.refreshAccount(AccountType.LEDGER, history)
    WalletDao.forgetStoredWallet()
}
