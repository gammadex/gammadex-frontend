import React from "react"
import TokenStore from "../stores/TokenStore"
import Config from '../Config'
import * as TokenActions from "../actions/TokenActions"
import {withRouter} from "react-router-dom"
import Conditional from "./CustomComponents/Conditional"
import TokenCreator from "./TokenChooser/TokenCreator"
import TokenDisplay from "./TokenChooser/TokenDisplay"
import {Box, BoxSection, BoxHeader} from "./CustomComponents/Box"

class TokenChooser extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            searchedToken: "",
            selectedToken: null,
            tokenList: Config.getTokens(),
            serverTickers: {},
            showMyTokens: false,
            showAddToken: false,
            userDefTokens: []
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
        this.props.history.push(`/exchange/${tokenName}`)
    }

    toggleMyTokens = event => {
        this.setState({showMyTokens: !this.state.showMyTokens})
    }

    toggleAddTokens = event => {
        this.setState({showAddToken: !this.state.showAddToken})
    }

    onCreateToken = token => {
        this.setState({userDefTokens: [...this.state.userDefTokens, token]})
        this.toggleAddTokens()
    }

    removeUserToken = token => {
        const truncatedList = this.state.userDefTokens.filter(ut => {
            ut.address !== token.address
        })

        this.setState({userDefTokens: truncatedList})
    }

    static getTokensToDisplay(tokenList, serverTickers, searchedToken, selectedToken) {
        // merge server side info in with token list from config
        const allTokens = tokenList.map(t => {
            const name = t.label !== undefined ? t.label : t.name
            const address = t.value !== undefined ? t.value : t.address
            
            let token = {name: name, address: address}
            
            const tokenDetails = serverTickers[address.toLowerCase()]
            if (tokenDetails) {
                token = Object.assign(token, {
                    percentChange: tokenDetails.percentChange,
                    volume: tokenDetails.baseVolume
                })
            }

            return token
        })

        // filter by search criteria if present
        if (searchedToken && searchedToken.length > 0) {
            return allTokens.filter(t => t.name.toLowerCase().includes(searchedToken.toLowerCase()))
        } else {
            return allTokens
        }
    }

    render() {
        const {tokenList, searchedToken, selectedToken, serverTickers, userDefTokens} = this.state
        
        const userTokens = TokenChooser.getTokensToDisplay(userDefTokens, serverTickers, searchedToken, selectedToken)
        const systemTokens = TokenChooser.getTokensToDisplay(tokenList, serverTickers, searchedToken, selectedToken)

        return (
            <div className="card token-chooser">
                <div className="card-header hdr-stretch">
                    <strong className="card-title">Tokens</strong>
                    <form className="form-inline">
                        <input onChange={this.onSearchTokenChange}
                               value={this.state.searchedToken}
                               placeholder="Search"
                               className="form-control"/>
                        <button value={this.state.searchedToken}
                                data-toggle="tooltip" data-placement="right"
                                title={(this.state.showMyTokens ? "Hide" : "Show") + " My Tokens"}
                                className="btn-sm btn-primary form-control lmargin" onClick={this.toggleMyTokens}>
                            {this.state.showMyTokens ? "^" : "V"}
                        </button>
                    </form>
                </div>

                <Conditional displayCondition={this.state.showMyTokens}>
                    <Box>
                        <BoxHeader>
                            <div className="hdr-stretch">
                                <strong className="card-title">My Tokens</strong>
                                <button className="btn btn-sm btn-secondary col-sm-2"
                                        onClick={this.toggleAddTokens}>{this.state.showAddToken ? "Accept" : "Edit"}</button>
                            </div>
                        </BoxHeader>

                        <TokenDisplay tokenList={userTokens} selectedToken={selectedToken} onTokenSelect={this.onTokenSelect}
                                      editMode={this.state.showAddToken} removeToken={this.removeUserToken}/>

                        <Conditional displayCondition={this.state.showAddToken}>
                            <TokenCreator create={this.onCreateToken}/>
                        </Conditional>
                    </Box>
                </Conditional>

                <Box title={this.state.showMyTokens ? "System Tokens" : ""}>
                    <TokenDisplay tokenList={systemTokens} selectedToken={selectedToken} onTokenSelect={this.onTokenSelect}/>
                </Box>
            </div>
        )
    }
}

export default withRouter(TokenChooser)