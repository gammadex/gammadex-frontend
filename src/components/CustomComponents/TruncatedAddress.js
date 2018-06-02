import React from "react"
import Truncated from "./Truncated"
import PropTypes from "prop-types"

export default class TruncatedAddress extends React.Component {
    render() {
        return <Truncated left="7" right="5" url={this.props.url}>{this.props.children}</Truncated>
    }
}

TruncatedAddress.propTypes = {
    url: PropTypes.string,
}