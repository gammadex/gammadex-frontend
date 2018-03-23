import React from "react"
import Config from '../../Config'
import TruncatedAddress from "./TruncatedAddress"

export default class Etherscan extends React.Component {
    render() {
        const childContent = this.getChildContent()
        const linkText = this.getLinkText(childContent)
        const type = this.props.type
        const typeDescription = this.getTypeDescription(type)
        const address = this.props.address || childContent
        const etherscanUrl = Config.getEtherscanUrl()

        return <a target="_blank" rel="noopener" href={`${etherscanUrl}/${type}/${address}`} data-toggle="tooltip"
                  title={"View " + typeDescription + " on etherscan.io"}>{linkText}</a>
    }

    getLinkText(childContent) {
        if (this.props.display === 'icon') {
            return <span className="fas fa-external-link-square-alt"></span>
        } else {
            const text = this.props.text || childContent

            if (this.props.display === 'truncate') {
                return <TruncatedAddress>{text}</TruncatedAddress>
            }

            return text
        }
    }

    getChildContent() {
        const children = React.Children.toArray(this.props.children)

        return (children.length > 0) ? children[0].toString() : null
    }

    getTypeDescription(type) {
        if (type == 'address') {
            return 'address'
        } else if (type == 'tx') {
            return 'transaction'
        }
    }
}