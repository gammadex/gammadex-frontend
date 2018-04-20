import React from "react"

export default class Conditional extends React.Component {
    render() {
        const {displayCondition} = this.props

        if (displayCondition) {
            return this.props.children
        } else {
            return null
        }
    }
}