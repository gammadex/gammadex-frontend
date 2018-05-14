import React from "react"
import TokenStore from "../stores/TokenStore"
import * as TokenActions from "../actions/TokenActions"
import {withRouter} from "react-router-dom"
import Conditional from "./CustomComponents/Conditional"
import TokenCreator from "./TokenChooser/TokenCreator"
import TokenDisplay from "./TokenChooser/TokenDisplay"
import {BoxHeader} from "./CustomComponents/Box"
import TokenListApi from "../apis/TokenListApi";
import _ from "lodash"

class TokenChooser extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            searchedToken: "",
            selectedToken: null,
            serverTickers: {},
            showAddToken: false
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
            userDefTokens: TokenStore.getUserTokens()
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

    toggleAddTokens = event => {
        this.setState({showAddToken: !this.state.showAddToken})
    }

    onCreateToken = token => {
        TokenActions.addUserToken(token)
        this.toggleAddTokens()
    }

    removeUserToken = token => {
        // swtich to the default token if the currently selected token is removed
        if (token.address === this.state.selectedToken.address) {
            const defToken = TokenListApi.getDefaultToken()
            this.onTokenSelect(defToken.name, defToken.address)
        }

        TokenActions.removeUserToken(token)
    }

    static getTokensToDisplay(tokenList, serverTickers, searchedToken, selectedToken) {
        return _(tokenList).map(token => _.pick(token, ['name', 'address']))
                           .map(token => _.assign(token, _.pick(serverTickers[token.address.toLowerCase()], ['percentChange', 'baseVolume'])))
                           .filter(token => !searchedToken || searchedToken.length === 0 || token.name.toLowerCase().includes(searchedToken.toLowerCase()))
                           .value()
    }

    render() {
        const {searchedToken, selectedToken, serverTickers} = this.state
        
        const userTokens = TokenChooser.getTokensToDisplay(TokenListApi.getUserTokens(), serverTickers, searchedToken, selectedToken)
        const systemTokens = TokenChooser.getTokensToDisplay(TokenListApi.getSystemTokens(), serverTickers, searchedToken, selectedToken)

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

                <TokenDisplay tokenList={systemTokens} selectedToken={selectedToken} onTokenSelect={this.onTokenSelect}/>

                <div className="card sub-card">
                    <BoxHeader>
                        <div className="hdr-stretch">
                            <strong className="card-title">Unlisted Tokens</strong>
                            {/*
                            <button className="btn btn-sm btn-secondary col-sm-2"
                                    onClick={this.toggleAddTokens}>{this.state.showAddToken ? "Accept" : "Edit"}</button>
                            */}
                        </div>
                    </BoxHeader>

                    <TokenDisplay tokenList={userTokens} selectedToken={selectedToken} onTokenSelect={this.onTokenSelect}
                                    editMode={true} removeToken={this.removeUserToken}/>

                    <TokenCreator create={this.onCreateToken}/>
                    {/*
                    <Conditional displayCondition={this.state.showAddToken}>
                    </Conditional>
                    */}
                </div>
            </div>
        )
    }
}

export default withRouter(TokenChooser)