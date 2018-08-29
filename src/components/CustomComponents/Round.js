import React from "react"
import {formatNumber, stripDecimalsOffLongNumber} from '../../util/FormatUtil'
import SoftZeros from "./SoftZeros"
import PropTypes from "prop-types"
import _ from "lodash"

export default class Round extends React.Component {
    DEFAULT_DPS = 3
    PRICE_DPS = 9
    PERCENT_DPS = 2
    MAX_LENGTH_ALLOW_0_IN_DP = 10

    render() {
        const originalNumber = this.getNumberToRound()
        if (! _.isUndefined(this.props.passThrough) && originalNumber === this.props.passThrough) {
            return originalNumber
        }

        if (!originalNumber) {
            if (this.props.fallback) {
                return this.props.fallback
            } else {
                return null
            }
        }

        const suffix = this.props.suffix ? this.props.suffix : ''
        const prefix = (this.props.prefix && !!originalNumber) ? this.props.prefix : ''
        const dps = this.props.price ? this.PRICE_DPS : this.props.percent ? this.PERCENT_DPS : this.props.decimals ? this.props.decimals : this.DEFAULT_DPS
        const number = formatNumber(originalNumber, dps)
        const cleanNumber = stripDecimalsOffLongNumber(number, this.MAX_LENGTH_ALLOW_0_IN_DP)
        const className =  this.props.classNameFunc ?  this.props.classNameFunc(number, cleanNumber) : ''

        if (this.props.softZeros) {
            return <span data-toggle="tooltip" title={originalNumber} className={className}>{prefix}<SoftZeros>{cleanNumber}</SoftZeros>{suffix}</span>
        } else {
            return <span data-toggle="tooltip" title={originalNumber} className={className}>{prefix}{cleanNumber}{suffix}</span>
        }
    }

    getNumberToRound() {
        const children = React.Children.toArray(this.props.children)

        return (children.length > 0) ? children[0].toString() : null
    }
}

Round.propTypes = {
    fallback: PropTypes.string,
    suffix: PropTypes.string,
    prefix: PropTypes.string,
    price: PropTypes.bool,
    percent: PropTypes.bool,
    softZeros: PropTypes.bool,
    classNameFunc: PropTypes.func,
    passThrough: PropTypes.any,
    decimals: PropTypes.number,
}