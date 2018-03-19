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
        return <div className="card-body">{this.props.children}</div>
    }
}

export class BoxFooter extends React.Component {
    render() {
        return <div className="card-footer">{this.props.children}</div>
    }
}

export class BoxHeader extends React.Component {
    render() {
        return <div className="card-header">{this.props.children}</div>
    }
}

