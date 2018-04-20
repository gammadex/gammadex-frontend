import React from "react"

export default class Truncated extends React.Component {
    render() {
        const children = React.Children.toArray(this.props.children)
        if (! children.length > 0) {
            return ""
        }

        const toTruncate = children[0].toString()
        const numKeepLeft = this.props.left ? parseInt(this.props.left, 10) : 3
        const numKeepRight = this.props.right ? parseInt(this.props.right, 10) : 3
        const spacer = this.props.spacer ? this.props.spacer : "..."
        const url = this.props.url ? this.props.url : null

        let truncated = toTruncate

        if (toTruncate.length > (numKeepLeft + numKeepRight)) {
            const leftPart = numKeepLeft > 0 ? toTruncate.substr(0, numKeepLeft) : ""
            const rightPart = numKeepRight > 0 ? toTruncate.substr(-numKeepRight) : ""

            let trunc = leftPart + spacer + rightPart

            if (url) {
                truncated = <a target="_blank" rel="noopener noreferrer" href={url} data-toggle="tooltip"
                               title={toTruncate}>{trunc}</a>
            } else {
                truncated = <span data-toggle="tooltip" title={toTruncate}>{trunc}</span>
            }
        }

        return truncated
    }
}
