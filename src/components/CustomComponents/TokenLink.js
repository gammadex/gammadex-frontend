import React from "react"
import PropTypes from "prop-types"
import TokenRepository from "../../util/TokenRepository"
import TruncatedAddress from "./TruncatedAddress"
import {withRouter} from "react-router-dom"
import {truncateAddress} from "../../util/FormatUtil"

class TokenLink extends React.Component {
    constructor(props) {
        super(props)
        this.onTokenSelect = this.onTokenSelect.bind(this)

        this.tokenIdentifier = this.tokenName ? this.tokenName : TokenRepository.getTokenIdentifier(this.props.tokenAddress)
    }

    onTokenSelect() {
        const newURL = this.tokenName ? `/exchange/${this.tokenName}` : `/exchange/${this.props.tokenAddress}`
        if (newURL !== this.props.history.location.pathname) {
            this.props.history.push(newURL)
        }
    }

    render() {
        if (this.tokenIdentifier === 'ETH') {
            return <span>ETH</span>
        }

        return <span className='clickable' onClick={this.onTokenSelect}>{this.tokenIdentifier}{this.props.pair ? '/ETH' : ''}</span>
    }
}

TokenLink.propTypes = {
    tokenAddress: PropTypes.string.isRequired,
    tokenName: PropTypes.string,
    pair: PropTypes.bool
}

export default withRouter(TokenLink)