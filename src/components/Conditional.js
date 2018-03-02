import React from "react"
import Empty from "./Empty"

export default class Conditional extends React.Component {
    render() {
        const {displayCondition} = this.props

        if (displayCondition) {
            return <span>{this.props.children}</span>
        } else {
            return <Empty/>
        }
    }
}