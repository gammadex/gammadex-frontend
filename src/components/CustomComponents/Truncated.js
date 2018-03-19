import React from "react"

export default class Truncated extends React.Component {
    render() {
        const toTruncate = this.props.children.toString()
        const numKeepLeft = this.props.left ? parseInt(this.props.left) : 3
        const numKeepRight = this.props.right ? parseInt(this.props.right) : 3
        const spacer = this.props.spacer ? this.props.spacer : "..."
        const url = this.props.url ? this.props.url : null

        let truncated = toTruncate

        if (toTruncate.length > (numKeepLeft + numKeepRight)) {
            let trunc = toTruncate.substr(0, numKeepLeft) + spacer + toTruncate.substr(-numKeepRight)

            if (url) {
                truncated = <a target="_blank" rel="noopener" href={url} data-toggle="tooltip"
                               title={toTruncate}>{trunc}</a>
            } else {
                truncated = <span data-toggle="tooltip" title={toTruncate}>{trunc}</span>
            }
        }

        return truncated
    }
}
