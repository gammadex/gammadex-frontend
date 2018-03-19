import React from "react"
import Truncated from "./Truncated"

export default class TruncatedAddress extends React.Component {
    render() {
        return <Truncated left="7" right="5" url={this.props.url}>{this.props.children}</Truncated>
    }
}
