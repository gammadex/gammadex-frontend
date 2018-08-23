import React from "react"

export default class ClickThrottle extends React.Component {
    constructor() {
        super()
        this.lastTime = Date.now()
        this.lastTarget = null
    }

    throttleClick = (event) => {
        const now = Date.now()

        if (this.lastTarget === event.target && now - this.lastTime < 500) {
            event.preventDefault()
            event.stopPropagation()
        } else {
            this.lastTime = now
            this.lastTarget = event.target
        }
    }

    render() {
        return (
            <span onClickCapture={this.throttleClick}>{this.props.children}</span>
        )
    }
}
