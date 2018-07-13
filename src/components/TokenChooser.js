import React from "react"
import TokenStore from "../stores/TokenStore"
import * as TokenActions from "../actions/TokenActions"
import {withRouter} from "react-router-dom"
import TokenRepository from "../util/TokenRepository"
import { setFavourite } from "../util/FavouritesDao"
import Favourites from "../util/Favourites"
import _ from "lodash"
import TokenChooserRow from "./TokenChooser/TokenChooserRow"
import OrderBookStore from "../stores/OrderBookStore"
import MarketResponseSpinner from "./MarketResponseSpinner"
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
            currentStats: OrderBookStore.getTradeStats(),
            containerHeight: 100
        }

        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
        this.saveCurrentPrices = this.saveCurrentPrices.bind(this)
    }

    componentWillMount() {
        TokenStore.on("change", this.onTokenStoreChange)
        OrderBookStore.on("change", this.saveCurrentPrices)
    }

    componentDidMount() {
        this.onTokenStoreChange()
    }

    componentWillUnmount() {
        TokenStore.removeListener("change", this.onTokenStoreChange)
        OrderBookStore.removeListener("change", this.saveCurrentPrices)
    }

    onTokenStoreChange() {
        this.setState({
            selectedToken: TokenStore.getSelectedToken(),
            searchedToken: TokenStore.getSearchToken(),
            serverTickers: TokenStore.getServerTickers(),
        })
    }

    saveCurrentPrices() {
        this.setState({
            currentStats: OrderBookStore.getTradeStats()
        })
    }

    onSearchTokenChange = (event) => {
        TokenActions.searchToken(event.target.value)
    }

    onTokenSelect = (tokenName, tokenAddress) => {
        const { onTokenSelectOverride } = this.props
        if(onTokenSelectOverride != null && typeof (onTokenSelectOverride) === 'function') {
            onTokenSelectOverride(tokenName)
        } else {
            const newURL = `/exchange/${tokenName}`
            if (newURL !== this.props.history.location.pathname) {
                setFavourite(Favourites.RECENT_TOKEN, tokenAddress)
                this.props.history.push(newURL)
            }
        }

    }

    selectTokenIfOnlyOne = (event, tokens) => {
        if (tokens && tokens.length === 1) {
            const token = tokens[0]
            this.onTokenSelect(token.symbol)
        }

        event.preventDefault()
    }

    static getTokensToDisplay(tokenList, serverTickers, searchedToken, selectedToken) {
        return _(tokenList).map(token => _.pick(token, ['symbol', 'address']))
            .map(token => _.assign(token, _.pick(serverTickers[token.address.toLowerCase()], ['percentChange', 'baseVolume'])))
            .filter(token => !searchedToken || searchedToken.length === 0 || token.symbol.toLowerCase().includes(searchedToken.toLowerCase()))
            .value()
    }

    onResize = (width, height) => {
        this.setState({
            containerHeight: height
        })
    }

    render() {
        const {searchedToken, selectedToken, serverTickers, currentStats, containerHeight} = this.state

        const systemTokens = TokenChooser.getTokensToDisplay(TokenRepository.getSystemTokens(), serverTickers, searchedToken, selectedToken)

        const tokenRows = systemTokens.map(systemToken => {
            const token = systemToken.address === currentStats.tokenAddress ? this.copyStats(systemToken, currentStats) : systemToken

            return <TokenChooserRow
                key={token.address}
                token={token}
                isSelected={selectedToken && token.address === selectedToken.address}
                onTokenSelect={this.onTokenSelect}/>
        })

        return (
            <div id="token-chooser-container" className="token-chooser-component">
                <ReactResizeDetector handleHeight onResize={this.onResize} resizableElementId="token-chooser-container"/>

                <div className="card " style={{"height": containerHeight}}>
                    <div className="card-header">
                        <div className="card-title">Tokens</div>
                        <div>
                            <form onSubmit={(event) => this.selectTokenIfOnlyOne(event, systemTokens)}>
                                <input onChange={this.onSearchTokenChange} value={this.state.searchedToken}
                                       placeholder="Search" className="form-control"/>
                            </form>
                        </div>
                    </div>

                    <CustomScroll heightRelativeToParent="100%">
                        <table className="table table-bordered table-hover table-no-bottom-border">
                            <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Volume ETH</th>
                                <th>% Change</th>
                            </tr>
                            </thead>
                            <tbody>{tokenRows}</tbody>
                        </table>
                    </CustomScroll>
                </div>
            </div>
        )
    }

    copyStats(systemToken, currentStats) {
        return Object.assign({}, systemToken, {
            baseVolume: currentStats.ethVolume,
            percentChange: currentStats.percentChange
        })
    }
}

export default withRouter(TokenChooser)