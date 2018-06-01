import PropTypes from 'prop-types'
import React from "react"
import _ from "lodash"

export default class RefreshButton extends React.Component {
    render() {
        const disabledClass = (!_.isUndefined(this.props.disabled) && this.props.disabled) ? "disabled" : ""
        const spinningClass = (!_.isUndefined(this.props.updating) && this.props.updating) ? "fa-spin" : ""

        return (
            <button className={"btn btn-primary " + disabledClass} onClick={this.props.onClick}><i
                className={"fas fa-sync " + spinningClass}/></button>
        )
    }
}

RefreshButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    updating: PropTypes.bool,
}