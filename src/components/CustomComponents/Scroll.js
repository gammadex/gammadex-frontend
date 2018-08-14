import React from "react"

import {Scrollbars} from 'react-custom-scrollbars'

export default class Scroll extends React.Component {
    render() {
        return (
            <Scrollbars thumbSize={40} renderThumbVertical={props => <div {...props} className="custom-scrollbar"/>}>
                {this.props.children}
            </Scrollbars>
        )
    }
}