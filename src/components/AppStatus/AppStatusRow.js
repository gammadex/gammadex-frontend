import React from "react"

export const States = {
    OK: {
        index: 0,
        class: "fa-check-circle buy-green"
    },
    WARN: {
        index: 1,
        class: "fa-info-circle clr-warn"
    },
    ERROR: {
        index: 2,
        class: "fa-exclamation-triangle sell-red"
    }
}

export default class AppStatusRow extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
                <div><strong>{this.props.title}</strong></div>
                <div><span className={"fas fa-lg " + this.props.state.class}/><span className="lmargin">{this.props.message}</span></div>
            </div>
        )
    }
}