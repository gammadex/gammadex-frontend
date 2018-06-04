import React from "react"
import TokenStore from "../stores/TokenStore"
import * as TokenActions from "../actions/TokenActions"
import {withRouter} from "react-router-dom"
import TokenCreator from "./UnlistedTokens/TokenCreator"
import {Box} from "./CustomComponents/Box"
import TokenListApi from "../apis/TokenListApi"
import _ from "lodash"
import UnlistedTokenRow from "./UnlistedTokens/UnlistedTokenRow"
import Conditional from "./CustomComponents/Conditional"

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
            userDefTokens: TokenStore.getUserTokens()
        })
    }

    onTokenSelect = (tokenName, tokenAddress) => {
        const newURL = `/exchange/${tokenAddress}`
        if (newURL !== this.props.history.location.pathname) {
            this.props.history.push(newURL)
        }
    }

    removeUserToken = token => {
        // switch to the default token if the currently selected token is removed
        if (token.address === this.state.selectedToken.address) {
            const defToken = TokenListApi.getDefaultToken()
            this.onTokenSelect(defToken.name, defToken.address)
        }

        TokenActions.removeUserToken(token)
    }

    render() {
        const {selectedToken} = this.state

        const userTokens = TokenListApi.getUserTokens()

        const tokenRows = userTokens.map(token => {
            return <UnlistedTokenRow
                key={token.address}
                token={token}
                isSelected={selectedToken && token.address === selectedToken.address}
                onTokenSelect={this.onTokenSelect}
                remove={this.removeUserToken}/>
        })

        return (
            <Box title="Unlisted Tokens">
                <Conditional displayCondition={tokenRows.length > 0}>
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover table-no-bottom-border">
                            <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Name</th>
                                <th>Smart Contract</th>
                            </tr>
                            </thead>
                            <tbody>{tokenRows}</tbody>
                        </table>
                    </div>
                </Conditional>

                <TokenCreator selectToken={this.onTokenSelect}/>
            </Box>
        )
    }
}

export default withRouter(TokenChooser)