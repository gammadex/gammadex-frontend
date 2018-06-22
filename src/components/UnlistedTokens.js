import React from "react"
import TokenStore from "../stores/TokenStore"
import * as TokenActions from "../actions/TokenActions"
import {withRouter} from "react-router-dom"
import TokenCreator from "./UnlistedTokens/TokenCreator"
import {Box, BoxSection} from "./CustomComponents/Box"
import TokenRepository from "../util/TokenRepository"
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

    onTokenSelect = (tokenAddress) => {
        const newURL = `/exchange/${tokenAddress}`
        if (newURL !== this.props.history.location.pathname) {
            this.props.history.push(newURL)
        }
    }

    removeUserToken = token => {
        const {selectedToken} = this.state

        TokenActions.removeUserToken(token)

        if (selectedToken && token.address.toLowerCase() === selectedToken.address.toLowerCase()) {
            TokenActions.unrecognisedTokenLookupComplete(token.address, token, null)
        }

        TokenActions.resetCreate("")
    }

    render() {
        const {selectedToken} = this.state

        const userTokens = TokenRepository.getUserTokens()

        const tokenRows = userTokens.map(token => {
            return <UnlistedTokenRow
                key={token.address}
                token={token}
                isSelected={selectedToken && token.address === selectedToken.address}
                onTokenSelect={this.onTokenSelect}
                remove={() => this.removeUserToken(token)}/>
        })

        return (
            <Box title="Unlisted Tokens" className="unlisted-tokens-component last-card">
                <BoxSection>
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
                </BoxSection>
            </Box>
        )
    }
}

export default withRouter(TokenChooser)