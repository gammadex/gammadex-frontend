import React from "react"
import Truncated from "./Truncated"

export default class TruncatedNumber extends React.Component {
    render() {
        return <Truncated left="10" right="0" url={this.props.url}>{this.props.children}</Truncated>
    }
}
