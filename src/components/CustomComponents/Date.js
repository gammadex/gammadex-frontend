import React from "react"
import {formatDateForDisplay} from "../../util/DateUtil"
import PropTypes from "prop-types"

export default class Date extends React.Component {
    render() {
        const children = React.Children.toArray(this.props.children)
        const fromDate = this.props.date
        if (! fromDate && !children.length > 0) {
            return ""
        }

        const date = fromDate ? fromDate : children[0].toString()
        const withYear = !!this.props.year
        const noSeconds = !!this.props.noSeconds

        return formatDateForDisplay(date, withYear, noSeconds)
    }
}

Date.propTypes = {
    date: PropTypes.string,
    year: PropTypes.bool,
    noSeconds: PropTypes.bool,
}