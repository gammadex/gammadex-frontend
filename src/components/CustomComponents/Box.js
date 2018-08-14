import React from "react"
import PropTypes from "prop-types"
import MarketResponseSpinner from "../MarketResponseSpinner"
import _ from 'lodash'
import {scrollOffersToBottom} from "../../util/OffersScroller"

export class Box extends React.Component {
    render() {
        const marketResponseSpinner = this.props.marketResponseSpinner ? <MarketResponseSpinner/> : null
        const extraClassName = this.props.className || ''
        const id = this.props.id || null

        const title = this.props.title ? <div className="card-header">
            <div><strong className="card-title">{this.props.title}{marketResponseSpinner}</strong></div>
        </div> : null

        if (id) {
            return <div id={id} className={"card " + extraClassName}>{title}{this.props.children}</div>
        } else {
            return <div className={"card " + extraClassName}>{title}{this.props.children}</div>
        }
    }
}

Box.propTypes = {
    title: PropTypes.string,
    marketResponseSpinner: PropTypes.bool,
    className: PropTypes.string,
    id: PropTypes.string
}

export class BoxSection extends React.Component {
    render() {
        const extraClasses = this.props.className ? this.props.className : ""
        const id = this.props.id || null

        if (id) {
            return <div id={id} className={"card-body " + extraClasses}>{this.props.children}</div>
        } else {
            return <div className={"card-body " + extraClasses}>{this.props.children}</div>
        }
    }
}

BoxSection.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string
}

export class BoxFooter extends React.Component {
    render() {
        return <div className="card-footer">{this.props.children}</div>
    }
}

export class BoxHeader extends React.Component {
    render() {
        const borderClass = this.props.noBorder ? "border-bottom-0" : ""
        const extraClassName = this.props.className || ''

        return <div className={"card-header " + borderClass + " " + extraClassName}>{this.props.children}</div>
    }
}

BoxHeader.propTypes = {
    noBorder: PropTypes.bool,
    className: PropTypes.string,
}

export class BoxTitle extends React.Component {
    constructor(props) {
        super(props)
        this.state = {expanded: false}
    }

    toggle = () => {
        let expanded = false

        _.each(this.props.ids, (blockType, elementId) => {
            const element = document.getElementById(elementId)
            if (element) {
                const currentState = element.style.display

                if (! currentState || currentState === 'none') {
                    element.style.display = blockType
                    expanded = true
                } else {
                    element.style.display = "none"
                }
            }
        })

        if (this.props.componentId) {
            const component = document.getElementById(this.props.componentId)

            if (component) {
                if (component.style.height === '50vh') {
                    component.style.minHeight = "42px"
                    component.style.height = "42px"
                    component.style.maxHeight = "42px"
                } else {
                    component.style.height = "50vh"
                    component.style.minHeight = "50vh"
                    component.style.maxHeight = "50vh"
                    expanded = true
                }
            }
        }

        if (expanded && _.isFunction(this.props.onExpand)) {
            this.props.onExpand()
        }

        this.setState({expanded})
    }

    render() {
        const {expanded} = this.state

        const extraClassName = this.props.className || ''
        const title = this.props.title || ''
        const icon = expanded ? 'fa-minus' : 'fa-plus'

        return (
            <div className={"box-title-container " + extraClassName}>
                <div className="mobile-only">
                    <button className="btn" onClick={() => this.toggle()}><i className={"fas " + icon}/></button>
                </div>
                <div className="card-title">{title}</div>
            </div>
        )
    }
}