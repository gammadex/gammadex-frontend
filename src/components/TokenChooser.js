import React from "react"
import TokenStore from "../stores/TokenStore"
import * as TokenActions from "../actions/TokenActions"
import { withRouter } from "react-router-dom"
import TokenRepository from "../util/TokenRepository"
import { getFavourite, setFavourite } from "../util/FavouritesDao"
import Favourites from "../util/Favourites"
import Config from "../Config"
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
            containerHeight: 100,
            favouritesTokens: getFavourite(Favourites.TOKENS) ? getFavourite(Favourites.TOKENS) : [],
            showFavouritesOnly: getFavourite(Favourites.SHOW_FAVOURITES_ONLY) ? getFavourite(Favourites.SHOW_FAVOURITES_ONLY) : false,
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
        if (onTokenSelectOverride != null && typeof (onTokenSelectOverride) === 'function') {
            onTokenSelectOverride(tokenName)
        } else {
            const newURL = `/exchange/${tokenName}`
            if (newURL !== this.props.history.location.pathname) {
                setFavourite(Favourites.RECENT_TOKEN, tokenAddress)
                this.props.history.push(newURL)
            }
        }
    }

    onFavourite = (tokenAddress) => {
        const { favouritesTokens } = this.state
        const copyFavouritesTokens = favouritesTokens.slice()
        if (copyFavouritesTokens.includes(tokenAddress.toLowerCase())) {
            _.remove(copyFavouritesTokens, t => t === tokenAddress.toLowerCase())
        } else {
            copyFavouritesTokens.push(tokenAddress.toLowerCase())
        }
        setFavourite(Favourites.TOKENS, copyFavouritesTokens)
        this.setState({
            favouritesTokens: copyFavouritesTokens
        })
    }

    selectTokenIfOnlyOne = (event, tokens) => {
        if (tokens && tokens.length === 1) {
            const token = tokens[0]
            this.onTokenSelect(token.symbol)
        }

        event.preventDefault()
    }

    static getTokensToDisplay(tokenList, serverTickers, searchedToken, selectedToken, favouritesTokens, showFavouritesOnly) {
        return _(tokenList).map(token => _.pick(token, ['symbol', 'address']))
            .map(token => _.assign(token, _.pick(serverTickers[token.address.toLowerCase()], ['percentChange', 'baseVolume'])))
            .filter(token => !showFavouritesOnly || favouritesTokens.includes(token.address.toLowerCase()))
            .filter(token => !searchedToken || searchedToken.length === 0 || token.symbol.toLowerCase().includes(searchedToken.toLowerCase()))
            .value()
    }

    onResize = (width, height) => {
        this.setState({
            containerHeight: height
        })
    }

    onShowFavouritesOnlyChange = (event) => {
        const { showFavouritesOnly } = this.state
        setFavourite(Favourites.SHOW_FAVOURITES_ONLY, !showFavouritesOnly)
        this.setState({
            showFavouritesOnly: !showFavouritesOnly
        })
    }

    render() {
        const { searchedToken, selectedToken, serverTickers, currentStats, containerHeight, favouritesTokens, showFavouritesOnly } = this.state

        const systemTokens = TokenChooser.getTokensToDisplay(TokenRepository.getSystemTokens(), serverTickers, searchedToken, selectedToken, favouritesTokens, showFavouritesOnly)

        const tokenRows = systemTokens.map(systemToken => {
            const token = systemToken.address === currentStats.tokenAddress ? this.copyStats(systemToken, currentStats) : systemToken

            return <TokenChooserRow
                key={token.address}
                token={token}
                isSelected={selectedToken && token.address === selectedToken.address}
                isFavourite={favouritesTokens.includes(token.address.toLowerCase())}
                onTokenSelect={this.onTokenSelect}
                onFavourite={this.onFavourite} />
        })

        return (
            <div id="token-chooser-container" className="token-chooser-component">
                <ReactResizeDetector handleHeight onResize={this.onResize} resizableElementId="token-chooser-container" />

                <div className="card " style={{ "height": containerHeight }}>
                    <div className="card-header">
                        <div className="card-title">Tokens</div>
                        <div>
                            <form class="form-inline" onSubmit={(event) => this.selectTokenIfOnlyOne(event, systemTokens)}>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="checkbox" id="showFavouritesOnlyCheckbox" onChange={this.onShowFavouritesOnlyChange} value={"true"} checked={showFavouritesOnly} />
                                    <label class="form-check-label" for="showFavouritesOnlyCheckbox">&nbsp;Show&nbsp;{<span className="fas fa-star"></span>}&nbsp;only</label>
                                </div>

                                <input onChange={this.onSearchTokenChange} value={this.state.searchedToken}
                                    placeholder="Search" className="form-control" />
                            </form>
                        </div>
                    </div>

                    <CustomScroll heightRelativeToParent="100%">
                        <table className="table table-bordered table-hover table-no-bottom-border">
                            <thead>
                                <tr>
                                    <th>Symbol</th>
                                    <th><span className="fas fa-star"></span></th>
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