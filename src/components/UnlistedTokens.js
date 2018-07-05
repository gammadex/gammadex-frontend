import React from "react"
import TokenStore from "../stores/TokenStore"
import * as TokenActions from "../actions/TokenActions"
import {withRouter} from "react-router-dom"
import TokenCreator from "./UnlistedTokens/TokenCreator"
import {Box, BoxSection} from "./CustomComponents/Box"
import TokenRepository from "../util/TokenRepository"
import UnlistedTokenRow from "./UnlistedTokens/UnlistedTokenRow"
import Conditional from "./CustomComponents/Conditional"
import ReactResizeDetector from 'react-resize-detector'
import CustomScroll from 'react-custom-scroll'
import 'react-custom-scroll/dist/customScroll.css'

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
                <ReactResizeDetector handleHeight onResize={this.onResize} resizableElementId="unlisted-tokens-container"/>
                <div style={{"height": containerHeight}}>
                    <Box title="My Unlisted Tokens" className="last-card">
                        <Conditional displayCondition={tokenRows.length > 0}>
                                <CustomScroll heightRelativeToParent="100%">
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
                                </CustomScroll>
                        </Conditional>

                        <BoxSection>
                            <TokenCreator selectToken={this.onTokenSelect}/>
                        </BoxSection>
                    </Box>
                </div>
            </div>
        )
    }
}

export default withRouter(TokenChooser)