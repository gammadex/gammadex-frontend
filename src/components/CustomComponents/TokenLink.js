import React from "react"
import PropTypes from "prop-types"
import TokenRepository from "../../util/TokenRepository"
import TruncatedAddress from "./TruncatedAddress"
import {withRouter} from "react-router-dom"
import {truncateAddress} from "../../util/FormatUtil"
import * as OrderUtil from "../../OrderUtil"
import _ from "lodash"
import GasPriceStore from "../../stores/GasPriceStore"

class TokenLink extends React.Component {
    constructor(props) {
        super(props)

        this.onTokenSelect = this.onTokenSelect.bind(this)
    }

    onTokenSelect() {
        const newURL = this.tokenName ? `/exchange/${this.tokenName}` : `/exchange/${this.props.tokenAddress}`
        if (newURL !== this.props.history.location.pathname) {
            this.props.history.push(newURL)
        }
    }

    render() {
        const {tokenName, tokenAddress, tokenIdentifier} = this.props
        const tokenId = tokenName ? tokenName : tokenIdentifier

        if (tokenId === 'ETH') {
            return <span>ETH</span>
        }

        return <span className='clickable' onClick={this.onTokenSelect}>{tokenId}{this.props.pair ? '/ETH' : ''}</span>
    }
}

TokenLink.propTypes = {
    tokenAddress: PropTypes.string.isRequired,
    tokenName: PropTypes.string,
    pair: PropTypes.bool
}

export default withRouter(TokenLink)