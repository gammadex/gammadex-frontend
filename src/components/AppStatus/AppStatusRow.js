import React from "react"

export const States = {
    OK: {
        index: 0,
        class: "fa-check-circle text-success"
    },
    PENDING: {
        index: 1,
        class: "fa-download text-info"
    },
    WARN: {
        index: 2,
        class: "fa-info-circle text-warning"
    },
    ERROR: {
        index: 3,
        class: "fa-exclamation-triangle text-danger"
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