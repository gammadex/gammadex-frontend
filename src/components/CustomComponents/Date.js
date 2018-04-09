import React from "react"
import {formatDateForDisplay} from "../../util/DateUtil"

export default class Date extends React.Component {
    render() {
        const children = React.Children.toArray(this.props.children)
        if (!children.length > 0) {
            return ""
        }

        const date = children[0].toString()
        const withYear = !!this.props.year
        const noSeconds = !!this.props.noSeconds

        return formatDateForDisplay(date, withYear, noSeconds)
    }
}