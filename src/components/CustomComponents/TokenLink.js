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
        let newURL = this.tokenName ? `/exchange/${this.tokenName}` : `/exchange/${this.props.tokenAddress}`
        if (this.props.linkByName === true) {
            newURL = `/exchange/${this.tokenName}`
        } else if (this.props.linkByName === false) {
            newURL = `/exchange/${this.props.tokenAddress}`
        }

        if (newURL !== this.props.history.location.pathname) {
            this.props.history.push(newURL)
        }
    }

    render() {
        const {tokenName, tokenAddress, tokenIdentifier} = this.props
        const tokenId = tokenName ? tokenName : tokenIdentifier
        const className = this.props.className || ''

        if (tokenId === 'ETH') {
            return <span>ETH</span>
        }

        return <span className={'clickable ' + className} onClick={this.onTokenSelect}>{tokenId}{this.props.pair ? '/ETH' : ''}</span>
    }
}

TokenLink.propTypes = {
    tokenAddress: PropTypes.string.isRequired,
    tokenName: PropTypes.string,
    pair: PropTypes.bool,
    linkByName: PropTypes.bool,
    className: PropTypes.string
}

export default withRouter(TokenLink)