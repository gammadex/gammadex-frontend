import React from "react"
import Truncated from "./Truncated"
import PropTypes from "prop-types"

export default class TruncatedNumber extends React.Component {
    render() {
        const length = this.props.length ? parseInt(this.props.length, 10) : 10

        return <Truncated left={length} right="0" url={this.props.url}>{this.props.children}</Truncated>
    }
}

TruncatedNumber.propTypes = {
    url: PropTypes.string,
    length: PropTypes.string,
}