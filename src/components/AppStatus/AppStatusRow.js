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
                <div className="row mt-2">
                    <div className={"col-lg-1 mr-2 fas fa-lg " + this.props.state.class}/>
                    <div>
                        <div className="lmargin">{this.props.message}</div>
                        <div className="lmargin">{this.props.children}</div>
                    </div>
                </div>
            </div>
        )
    }
}