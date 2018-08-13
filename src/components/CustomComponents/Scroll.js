import React from "react"

import {Scrollbars} from 'react-custom-scrollbars'
import PropTypes from "prop-types"

export default class Scroll extends React.Component {
    render() {
        const extraClassName = this.props.className || ''
        const id = this.props.id || null

        return (
            <div id={id} className={"full-height " + extraClassName}>
                <Scrollbars thumbSize={40} renderThumbVertical={props => <div {...props} className="custom-scrollbar"/>}>
                    {this.props.children}
                </Scrollbars>
            </div>
        )
    }
}

Scroll.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string
}