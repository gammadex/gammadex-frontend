import React from "react"
import PropTypes from "prop-types"
import TokenRepository from "../../util/TokenRepository"
import TruncatedAddress from "./TruncatedAddress"
import {withRouter} from "react-router-dom"

class TokenLink extends React.Component {
    constructor(props) {
        super(props)
        this.onTokenSelect = this.onTokenSelect.bind(this)
        this.tokenName = this.props.tokenName ? this.props.tokenName : TokenRepository.getTokenName(this.props.tokenAddress)
    }

    onTokenSelect() {
        const newURL = this.tokenName ? `/exchange/${this.tokenName}` : `/exchange/${this.props.tokenAddress}`
        if (newURL !== this.props.history.location.pathname) {
            this.props.history.push(newURL)
        }
    }

    render() {
        if(this.tokenName && this.tokenName === 'ETH') {
            return <span>ETH</span>
        }
        const { pair = false } = this.props
        if(this.tokenName) {
            return <span className='clickable' onClick={this.onTokenSelect}>{this.tokenName}{pair ? '/ETH' : ''}</span>
        } else {
            return <span className='clickable' onClick={this.onTokenSelect}><TruncatedAddress>{this.props.tokenAddress}</TruncatedAddress>{pair ? '/ETH' : ''}</span>
        }
    }
}

TokenLink.propTypes = {
    tokenAddress: PropTypes.string,
    tokenName: PropTypes.string,
    pair: PropTypes.bool
}

export default withRouter(TokenLink)