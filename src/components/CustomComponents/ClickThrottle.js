import React from "react"

export default class ClickThrottle extends React.Component {
    constructor() {
        super()
        this.lastTime = Date.now()
    }

    throttleClick = (event) => {
        const now = Date.now()

        if (now - this.lastTime < 500) {
            event.preventDefault()
            event.stopPropagation()
        } else {
            this.lastTime = now
        }
    }

    render() {
        return (
            <span onClickCapture={this.throttleClick}>{this.props.children}</span>
        )
    }
}
