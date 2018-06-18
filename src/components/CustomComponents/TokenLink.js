import React from "react"
import PropTypes from "prop-types"
import TokenRepository from "../../util/TokenRepository"
import TruncatedAddress from "./TruncatedAddress"
import {withRouter} from "react-router-dom"
import {truncateAddress} from "../../util/FormatUtil"
import * as OrderUtil from "../../OrderUtil"
import _ from "lodash"
import TokenStore from "../../stores/TokenStore"
import GasPriceStore from "../../stores/GasPriceStore"

class TokenLink extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tokenIdentifier: props.tokenName ? props.tokenName : TokenStore.getTokenIdentifier(this.props.tokenAddress)
        }

        this.onTokenSelect = this.onTokenSelect.bind(this)
        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
    }

    componentWillMount() {
        TokenStore.on("change", this.onTokenStoreChange)
    }

    componentWillUnmount() {
        TokenStore.removeListener("change", this.onTokenStoreChange)
    }

    onTokenStoreChange() {
        this.setState((prevState, props) => ({
            tokenIdentifier: props.tokenName ? props.tokenName : TokenStore.getTokenIdentifier(this.props.tokenAddress)
        }))
    }

    onTokenSelect() {
        const newURL = this.tokenName ? `/exchange/${this.tokenName}` : `/exchange/${this.props.tokenAddress}`
        if (newURL !== this.props.history.location.pathname) {
            this.props.history.push(newURL)
        }
    }

    render() {
        const {tokenIdentifier} = this.state

        if (tokenIdentifier === 'ETH') {
            return <span>ETH</span>
        }

        return <span className='clickable' onClick={this.onTokenSelect}>{tokenIdentifier}{this.props.pair ? '/ETH' : ''}</span>
    }
}

TokenLink.propTypes = {
    tokenAddress: PropTypes.string.isRequired,
    tokenName: PropTypes.string,
    pair: PropTypes.bool
}

export default withRouter(TokenLink)