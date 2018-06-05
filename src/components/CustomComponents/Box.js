import React from "react"
import PropTypes from "prop-types"
import MarketResponseSpinner from "../MarketResponseSpinner"

export class Box extends React.Component {
    render() {
        const marketResponseSpinner = this.props.marketResponseSpinner ? <MarketResponseSpinner/> : null

        const title = this.props.title ? <div className="card-header">
            <strong className="card-title">{this.props.title}{marketResponseSpinner}</strong>
        </div> : ""

        return <div className="card">{title}{this.props.children}</div>
    }
}

Box.propTypes = {
    title: PropTypes.string,
    marketResponseSpinner: PropTypes.bool
}

export class BoxSection extends React.Component {
    render() {
        const extraClasses = this.props.className ? this.props.className : ""

        return <div className={"card-body " + extraClasses}>{this.props.children}</div>
    }
}

BoxSection.propTypes = {
    className: PropTypes.string,
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

BoxHeader.propTypes = {
    noBorder: PropTypes.bool,
}