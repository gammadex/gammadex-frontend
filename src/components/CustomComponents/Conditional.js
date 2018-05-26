import React from "react"
import EmptyTableMessage from "./EmptyTableMessage"
import PropTypes from 'prop-types'

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

Conditional.propTypes = {
    displayCondition: PropTypes.string,
    fallbackMessage: PropTypes.string,
}