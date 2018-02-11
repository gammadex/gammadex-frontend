import React from "react"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import TokenStore from '../stores/TokenStore'
import AccountStore from '../stores/AccountStore'
import AccountTable from '../components/Account/AccountTable'
import Config from '../Config'

import * as AccountActions from "../actions/AccountActions"

export default class AccountDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            account: null,
            accountRetrieved: false,
            walletBalanceEthWei: 0,
            walletBalanceTokWei: 0,
            exchangeBalanceEthWei: 0,
            exchangeBalanceTokWei: 0
        }
    }

    componentWillMount() {
        AccountStore.on("change", this.onAccountChange)
        TokenStore.on("change", this.onTokenChange)
    }

    onTokenChange = () => {
        if(this.state.accountRetrieved) {
            this.refreshEthAndTokBalance(this.state.account, TokenStore.getSelectedToken().address)
        }
    }

    onAccountChange = () => {
        const prevRetrieved = this.state.accountRetrieved
        this.setState(AccountStore.getAccountState())
        // TODO this is shit, need to rationalize the dependency between user and balance retrieval
        if (!prevRetrieved && this.state.accountRetrieved) {
            // i now have a user address so refresh balances
            this.refreshEthAndTokBalance(this.state.account, TokenStore.getSelectedToken().address)
        }
    }

    refreshEthAndTokBalance(account, tokenAddress) {
        EtherDeltaWeb3.refreshEthAndTokBalance(account, tokenAddress)
        .then(balance => {
            AccountActions.balanceRetrieved(balance)
        })
        .catch(error => console.log(`failed to refresh balances: ${error.message}`))
    }

    componentDidMount() {
        EtherDeltaWeb3.refreshAccount()
            .then(account => {
                AccountActions.accountRetrieved(account)
            })
            .catch(error => console.log(`failed to refresh user account: ${error.message}`))
    }

    render() {
        const { token } = this.props
        const tokenDecimals = Config.getTokenDecimals(token.name)
        const {
            account,
            accountRetrieved,
            walletBalanceEthWei,
            walletBalanceTokWei,
            exchangeBalanceEthWei,
            exchangeBalanceTokWei } = this.state

        let accountLink = <span className="text-danger">No account</span>
        if (accountRetrieved) {
            accountLink = <a href={`https://ropsten.etherscan.io/address/${account}`}>{account}</a>
        }

        return (
            <div>
                <h2>Balances</h2>
                <div className="row">
                    <div className="col-lg-12">
                        Account: {accountLink}
                    </div>
                    <div className="col-lg-12">
                        <AccountTable
                            base="ETH"
                            token={token.name}
                            baseDecimals={18}
                            tokenDecimals={tokenDecimals}
                            walletBalanceEthWei={walletBalanceEthWei}
                            walletBalanceTokWei={walletBalanceTokWei}
                            exchangeBalanceEthWei={exchangeBalanceEthWei}
                            exchangeBalanceTokWei={exchangeBalanceTokWei} />
                    </div>
                </div>
            </div>
        )
    }
}