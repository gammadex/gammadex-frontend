import React from "react"

export class Box extends React.Component {
    render() {
        const title = this.props.title ? <div className="card-header">
            <strong className="card-title">{this.props.title}</strong>
        </div> : ""

        return <div className="card">{title}{this.props.children}</div>
    }
}

export class BoxSection extends React.Component {
    render() {
        const extraClasses = this.props.className ? this.props.className : ""

        return <div className={"card-body " + extraClasses}>{this.props.children}</div>
    }
}

export class BoxFooter extends React.Component {
    render() {
        return <div className="card-footer">{this.props.children}</div>
    }
}

export class BoxHeader extends React.Component {
    render() {
        const borderClass = this.props.noBorder ? "border-bottom-0" : ""

        return <div className={"card-header " + borderClass}>{this.props.children}</div>
    }
}

