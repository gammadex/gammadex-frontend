import React from "react"
import TokenStore from "../stores/TokenStore"
import * as TokenActions from "../actions/TokenActions"
import {withRouter} from "react-router-dom"
import TokenListApi from "../apis/TokenListApi"
import _ from "lodash"
import TokenChooserRow from "./TokenChooser/TokenChooserRow"

class TokenChooser extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            searchedToken: "",
            selectedToken: null,
            serverTickers: {}
        }

        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
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

    onTokenStoreChange() {
        this.setState({
            selectedToken: TokenStore.getSelectedToken(),
            searchedToken: TokenStore.getSearchToken(),
            serverTickers: TokenStore.getServerTickers(),
        })
    }

    onSearchTokenChange = (event) => {
        TokenActions.searchToken(event.target.value)
    }

    onTokenSelect = (tokenName, tokenAddress) => {
        const newURL = `/exchange/${tokenName}`
        if (newURL !== this.props.history.location.pathname) {
            this.props.history.push(newURL)
        }
    }

    static getTokensToDisplay(tokenList, serverTickers, searchedToken, selectedToken) {
        return _(tokenList).map(token => _.pick(token, ['name', 'address']))
                           .map(token => _.assign(token, _.pick(serverTickers[token.address.toLowerCase()], ['percentChange', 'baseVolume'])))
                           .filter(token => !searchedToken || searchedToken.length === 0 || token.name.toLowerCase().includes(searchedToken.toLowerCase()))
                           .value()
    }

    render() {
        const {searchedToken, selectedToken, serverTickers} = this.state

        // TODO - TokenListApi has data as state - it should be kept in a Store
        const systemTokens = TokenChooser.getTokensToDisplay(TokenListApi.getSystemTokens(), serverTickers, searchedToken, selectedToken)

        const tokenRows = systemTokens.map(token => {
            return <TokenChooserRow
                key={token.address}
                token={token}
                isSelected={selectedToken && token.symbol === selectedToken.name}  // TODO - wouldn't address comparison be better
                onTokenSelect={this.onTokenSelect}/>
        })

        return (
            <div className="card token-chooser">
                <div className="card-header">
                    <div className="row hdr-stretch">
                        <div className="col-lg-6">
                            <strong className="card-title">Tokens</strong>
                        </div>
                        <div className="col-lg-6">
                            <input onChange={this.onSearchTokenChange} value={this.state.searchedToken}
                                   placeholder="Search" className="form-control"/>
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-striped table-bordered table-hover table-no-bottom-border">
                        <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Volume ETH</th>
                            <th>% Change</th>
                        </tr>
                        </thead>
                        <tbody>{tokenRows}</tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default withRouter(TokenChooser)