import React from "react"
import {formatNumber, stripDecimalsOffLongNumber} from '../../util/FormatUtil'
import SoftZeros from "./SoftZeros"

export default class Round extends React.Component {
    DEFAULT_DPS = 3
    PRICE_DPS = 9
    PERCENT_DPS = 2
    MAX_LENGTH_ALLOW_0_IN_DP = 10

    render() {
        const originalNumber = this.getNumberToRound()
        if (!originalNumber) {
            if (this.props.fallback) {
                return this.props.fallback
            } else {
                return null
            }
        }

        const suffix = this.props.suffix ? this.props.suffix : ''
        const dps = this.props.price ? this.PRICE_DPS : this.props.percent ? this.PERCENT_DPS : this.DEFAULT_DPS
        const number = formatNumber(originalNumber, dps)
        const cleanNumber = stripDecimalsOffLongNumber(number, this.MAX_LENGTH_ALLOW_0_IN_DP)
        const className =  this.props.classNameFunc ?  this.props.classNameFunc(number, cleanNumber) : ''

        if (this.props.softZeros) {
            return <span data-toggle="tooltip" title={originalNumber} className={className}><SoftZeros>{cleanNumber}</SoftZeros>{suffix}</span>
        } else {
            return <span data-toggle="tooltip" title={originalNumber} className={className}>{cleanNumber}{suffix}</span>
        }
    }

    getNumberToRound() {
        const children = React.Children.toArray(this.props.children)

        return (children.length > 0) ? children[0].toString() : null
    }
}
