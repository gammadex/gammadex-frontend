import React from "react"
import EmptyTableMessage from "./EmptyTableMessage"

export default class Conditional extends React.Component {
    render() {
        const {displayCondition} = this.props
        const fallbackMessage = this.props.fallbackMessage

        if (displayCondition) {
            return this.props.children
        } else {
            if (fallbackMessage) {
                return <EmptyTableMessage>{fallbackMessage}</EmptyTableMessage>
            } else {
                return null
            }
        }
    }
}