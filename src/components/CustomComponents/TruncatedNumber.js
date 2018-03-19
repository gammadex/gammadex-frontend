import React from "react"

export default class TruncatedNumber extends React.Component {
    render() {
        const number = this.props.children.toString()
        const decimals = this.props.decimals ? this.props.decimals : 5

        let truncatedNumber = <span>{number}</span>
        if (number.match("\.\\d{" + decimals + ",}")) {
            const regex = new RegExp("(\\d+\\.\\d{" + decimals + "}).*")
            let trunc = number.replace(regex, (match, keep) => {
                return keep + "..."
            })
            truncatedNumber = <span data-toggle="tooltip" title={number}>{trunc}</span>
        }

        return truncatedNumber
    }
}
