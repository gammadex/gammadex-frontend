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
import TokenChooserSort from './TokenChooser/TokenChooserSort'

class TokenChooser extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            searchedToken: "",
            selectedToken: null,
            serverTickers: {},
            currentStats: OrderBookStore.getTradeStats(),
            containerHeight: 100,
            sortType: this.getSortType(),
            favouritesTokens: getFavourite(Favourites.TOKENS) ? getFavourite(Favourites.TOKENS) : [],
            showFavouritesOnly: getFavourite(Favourites.SHOW_FAVOURITES_ONLY) == null ? false : getFavourite(Favourites.SHOW_FAVOURITES_ONLY)
        }

        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
        this.saveCurrentPrices = this.saveCurrentPrices.bind(this)
        this.onHeaderChange = this.onSortTypeChange.bind(this)
    }

    getSortType() {
        if (getFavourite(Favourites.TOKEN_CHOOSER_SORT) == null ||
            ![TokenChooserSort.ASC_SYMBOL, TokenChooserSort.DESC_SYMBOL,
            TokenChooserSort.ASC_VOLUME, TokenChooserSort.DESC_VOLUME,
            TokenChooserSort.ASC_CHANGE, TokenChooserSort.DESC_CHANGE].includes(getFavourite(Favourites.TOKEN_CHOOSER_SORT))) {
            return TokenChooserSort.ASC_SYMBOL
        } else {
            return getFavourite(Favourites.TOKEN_CHOOSER_SORT)
        }
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

    onSortTypeChange(sortType, defaultSort, ascendingSort, descendingSort) {
        let newSort = defaultSort
        if (sortType === ascendingSort) {
            newSort = descendingSort
        } else if (sortType === descendingSort) {
            newSort = ascendingSort
        }
        setFavourite(Favourites.TOKEN_CHOOSER_SORT, newSort)
        this.setState({
            sortType: newSort
        })
    }

    onSymbolHeader = () => {
        const { sortType } = this.state
        this.onSortTypeChange(sortType, TokenChooserSort.ASC_SYMBOL, TokenChooserSort.ASC_SYMBOL, TokenChooserSort.DESC_SYMBOL)
    }

    onVolumeHeader = () => {
        const { sortType } = this.state
        this.onSortTypeChange(sortType, TokenChooserSort.DESC_VOLUME, TokenChooserSort.ASC_VOLUME, TokenChooserSort.DESC_VOLUME)
    }

    onChangeHeader = () => {
        const { sortType } = this.state
        this.onSortTypeChange(sortType, TokenChooserSort.DESC_CHANGE, TokenChooserSort.ASC_CHANGE, TokenChooserSort.DESC_CHANGE)
    }

    sortTokens(tokens, sortType) {
        let sortAttribute = t => t.symbol.toLowerCase().replace(/\s/g, "")
        if (sortType.endsWith('VOLUME')) {
            sortAttribute = t => t.baseVolume == null ? -1 : t.baseVolume
        } else if (sortType.endsWith('CHANGE')) {
            sortAttribute = t => t.percentChange == null ? 0 : t.percentChange
        }
        const sorted = _.sortBy(tokens, sortAttribute)
        return sortType.startsWith('ASC') ? sorted : _.reverse(sorted)
    }

    render() {
        const { searchedToken, selectedToken, serverTickers, currentStats, containerHeight, favouritesTokens, showFavouritesOnly, sortType } = this.state

        const systemTokens = TokenChooser.getTokensToDisplay(TokenRepository.getSystemTokens(),
            serverTickers,
            searchedToken,
            selectedToken,
            favouritesTokens,
            showFavouritesOnly).map(systemToken => {
                return systemToken.address === currentStats.tokenAddress ? this.copyStats(systemToken, currentStats) : systemToken
            })

        const sortedTokens = this.sortTokens(systemTokens, sortType)

        const tokenRows = sortedTokens.map(token => {

            return <TokenChooserRow
                key={token.address}
                token={token}
                isSelected={selectedToken && token.address === selectedToken.address}
                isFavourite={favouritesTokens.includes(token.address.toLowerCase())}
                onTokenSelect={this.onTokenSelect}
                onFavourite={this.onFavourite} />
        })

        const symbolSortClass = sortType === TokenChooserSort.ASC_SYMBOL ? "fas fa-sort-up" : sortType === TokenChooserSort.DESC_SYMBOL ? "fas fa-sort-down" : ""
        const volumeSortClass = sortType === TokenChooserSort.ASC_VOLUME ? "fas fa-sort-up" : sortType === TokenChooserSort.DESC_VOLUME ? "fas fa-sort-down" : ""
        const changeSortClass = sortType === TokenChooserSort.ASC_CHANGE ? "fas fa-sort-up" : sortType === TokenChooserSort.DESC_CHANGE ? "fas fa-sort-down" : ""

        return (
            <div id="token-chooser-container" className="token-chooser-component">
                <ReactResizeDetector handleHeight onResize={this.onResize} resizableElementId="token-chooser-container" />

                <div className="card " style={{ "height": containerHeight }}>
                    <div className="card-header">
                        <div className="card-title">Tokens</div>
                        <div>
                            <form className="form-inline" onSubmit={(event) => this.selectTokenIfOnlyOne(event, sortedTokens)}>
                                <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="checkbox" id="showFavouritesOnlyCheckbox" onChange={this.onShowFavouritesOnlyChange} value={"true"} checked={showFavouritesOnly} />
                                    <label className="form-check-label" htmlFor="showFavouritesOnlyCheckbox">&nbsp;Show&nbsp;{<span className="fas fa-star"></span>}&nbsp;only</label>
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
                                    <th onClick={this.onSymbolHeader}>Symbol&nbsp;&nbsp;{<span className={symbolSortClass}></span>}</th>
                                    <th><span className="fas fa-star"></span></th>
                                    <th onClick={this.onVolumeHeader}>Volume ETH&nbsp;&nbsp;{<span className={volumeSortClass}></span>}</th>
                                    <th onClick={this.onChangeHeader}>% Change&nbsp;&nbsp;{<span className={changeSortClass}></span>}</th>
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