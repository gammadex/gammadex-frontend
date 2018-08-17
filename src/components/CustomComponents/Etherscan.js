import React from "react"
import Config from '../../Config'
import TruncatedAddress from "./TruncatedAddress"
import PropTypes from "prop-types"

export default class Etherscan extends React.Component {
    render() {
        const childContent = this.getChildContent()
        const linkText = this.getLinkText(childContent)
        const type = this.props.type
        const typeDescription = this.getTypeDescription(type)
        const address = this.props.address || childContent
        const etherscanUrl = Config.getEtherscanUrl()
        const hrefOnly = !!this.props.href

        if (hrefOnly) {
            return `${etherscanUrl}/${type}/${address}`
        } else {
            return <a target="_blank" rel="noopener noreferrer" href={`${etherscanUrl}/${type}/${address}`} data-toggle="tooltip"
                      title={"View " + typeDescription + " on etherscan.io"}>{linkText}</a>
        }
    }

    getLinkText(childContent) {
        if (this.props.display === 'icon') {
            return <span className="fas fa-external-link-square-alt"></span>
        } else {
            const text = this.props.text || childContent || this.props.address

            if (this.props.display === 'truncate') {
                return <TruncatedAddress>{text}</TruncatedAddress>
            } else if (this.props.display === 'long-truncate') {
                return <TruncatedAddress bothSides>{text}</TruncatedAddress>
            }

            return text
        }
    }

    getChildContent() {
        const children = React.Children.toArray(this.props.children)

        return (children.length > 0) ? children[0].toString() : null
    }

    getTypeDescription(type) {
        if (type === 'address') {
            return 'address'
        } else if (type === 'tx') {
            return 'transaction'
        }
    }
}

Etherscan.propTypes = {
    type: PropTypes.string,
    address: PropTypes.string,
    href: PropTypes.string,
    display: PropTypes.string,
    text: PropTypes.string,
}