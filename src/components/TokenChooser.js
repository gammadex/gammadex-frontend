import React from "react"
import TokenStore from "../stores/TokenStore"
import TokenChooserRow from "./TokenChooser/TokenChooserRow"
import Config from '../Config'
import * as TokenActions from "../actions/TokenActions"
import * as WebSocketActions from "../actions/WebSocketActions"

export default class TokenChooser extends React.Component {
    state = {
        searchedToken: "",
        selectedToken: null,
        tokenList: Config.getTokens(),
        serverTickers: {},
    }

    componentWillMount() {
        TokenStore.on("change", this.onTokenStoreChange)
    }

    componentDidMount() {
        this.onTokenStoreChange()
    }

    componentWillUnmount() {
        TokenStore.removeListener("change", this.onTokenStoreChange)
    }

    onTokenStoreChange = () => {
        this.setState({
            selectedToken: TokenStore.getSelectedToken(),
            searchedToken: TokenStore.getSearchToken(),
            serverTickers: TokenStore.getServerTickers(),
        })
    }

    onSearchTokenChange = (event) => {
        TokenActions.searchToken(event.target.value)
    }

    onTokenSelect = (tokenSymbol, tokenAddress) => {
        TokenActions.selectToken(tokenSymbol, tokenAddress)
        WebSocketActions.getMarket()
    }

    render() {
        const {tokenList, searchedToken, selectedToken, serverTickers} = this.state

        let filteredTokens = this.getTokensToDisplay(tokenList, serverTickers, searchedToken)

        const tokenRows = filteredTokens.map(token => {
            const isSelected = selectedToken && token.symbol === selectedToken.name

            return <TokenChooserRow
                key={token.address}
                token={token}
                isSelected={isSelected}
                onTokenSelect={this.onTokenSelect}
            />
        })

        return (
            <span>
                <h1>Token Chooser</h1>
            <div>
                <input onChange={this.onSearchTokenChange} value={this.state.searchedToken} placeholder="Search"/>
            </div>
                <table className="table table-striped table-bordered table-hover">
                <thead>
                <tr>
                    <th>Symbol</th>
                    <th>Volume (ETH)</th>
                    <th>% Change</th>
                </tr>
                </thead>
                <tbody>
                {tokenRows}
                </tbody>
            </table>
                <hr/>
            </span>
        )
    }

    getTokensToDisplay(tokenList, serverTickers, searchedToken) {
        // merge server side info in with token list from config
        const allTokens = tokenList.map(t => {
            const symbol = t.label
            const address = t.value
            const tokenDetails = serverTickers[address.toLowerCase()]

            const token = {symbol: symbol, address: address}
            if (tokenDetails) {
                return Object.assign(token, {
                    percentChange: tokenDetails.percentChange,
                    volume: tokenDetails.baseVolume,
                })
            } else {
                return token
            }
        })

        // filter by search criteria if present
        if (searchedToken && searchedToken.length > 0) {
            return allTokens.filter(t => {
                return t.symbol.toLowerCase().includes(searchedToken.toLowerCase())
            })
        } else {
            return allTokens
        }
    }
}