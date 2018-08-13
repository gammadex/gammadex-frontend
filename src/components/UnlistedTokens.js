import React from "react"
import TokenStore from "../stores/TokenStore"
import * as TokenActions from "../actions/TokenActions"
import {withRouter} from "react-router-dom"
import TokenCreator from "./UnlistedTokens/TokenCreator"
import {Box, BoxSection} from "./CustomComponents/Box"
import TokenRepository from "../util/TokenRepository"
import {setFavourite} from "../util/FavouritesDao"
import Favourites from "../util/Favourites"
import UnlistedTokenRow from "./UnlistedTokens/UnlistedTokenRow"
import Conditional from "./CustomComponents/Conditional"
import Scroll from "./CustomComponents/Scroll"

class TokenChooser extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            searchedToken: "",
            selectedToken: null,
            serverTickers: {},
            containerHeight: 100
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
            setFavourite(Favourites.RECENT_TOKEN, tokenAddress)
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

    onResize = (width, height) => {
        this.setState({
            containerHeight: height
        })
    }

    render() {
        const {selectedToken, containerHeight} = this.state

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
            <div id="unlisted-tokens-container" className="unlisted-tokens-component">
                <div className="full-height">
                    <Box title="My Unlisted Tokens" className="last-card">
                        <BoxSection className="with-bottom-border">
                            <TokenCreator selectToken={this.onTokenSelect}/>
                        </BoxSection>

                        <Conditional displayCondition={tokenRows.length > 0}>
                            <Scroll>
                                <table className="table table-striped table-hover table-bordered" style={{"borderTopWidth": "1px"}}>
                                    <thead>
                                    <tr>
                                        <th>Symbol</th>
                                        <th>Name</th>
                                        <th>Smart Contract</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>{tokenRows}</tbody>
                                </table>
                            </Scroll>
                        </Conditional>
                    </Box>
                </div>
            </div>
        )
    }
}

export default withRouter(TokenChooser)