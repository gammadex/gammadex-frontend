import React from "react"
import {truncate} from "../../util/FormatUtil"

export default class Truncated extends React.Component {
    render() {
        const children = React.Children.toArray(this.props.children)
        if (! children.length > 0) {
            return ""
        }

        const toTruncate = children[0].toString()
        let truncated = truncate(toTruncate, this.props)

        if (toTruncate !== truncated) {
            const url = this.props.url ? this.props.url : null
            if (url) {
                truncated = <a target="_blank" rel="noopener noreferrer" href={url} data-toggle="tooltip"
                               title={toTruncate}>{truncated}</a>
            } else {
                truncated = <span data-toggle="tooltip" title={toTruncate}>{truncated}</span>
            }
        }

        return truncated
    }
}
