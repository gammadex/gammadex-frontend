import React from "react"
import {formatNumber, stripDecimalsOffLongNumber} from '../../util/FormatUtil'

export default class Round extends React.Component {
    DEFAULT_DPS = 3
    PRICE_DPS = 9
    MAX_LENGTH_ALLOW_0_IN_DP = 10

    render() {
        const originalNumber = this.getNumberToRound()
        if (!originalNumber) {
            return null
        }

        const dps = this.props.price ? this.PRICE_DPS : this.DEFAULT_DPS
        const number = formatNumber(originalNumber, dps)
        const cleanNumber = stripDecimalsOffLongNumber(number, this.MAX_LENGTH_ALLOW_0_IN_DP)

        const url = this.props.url ? this.props.url : null

        if (url) {
            return <a target="_blank" rel="noopener" href={url} data-toggle="tooltip"
                      title={originalNumber}>{cleanNumber}</a>
        } else {
            return <span data-toggle="tooltip" title={originalNumber}>{cleanNumber}</span>
        }
    }


    getNumberToRound() {
        const children = React.Children.toArray(this.props.children)

        return (children.length > 0) ? children[0].toString() : null
    }
}
