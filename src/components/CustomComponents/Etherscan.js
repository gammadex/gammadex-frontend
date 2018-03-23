import React from "react"
import Config from '../../Config'
import TruncatedAddress from "./TruncatedAddress"

export default class Etherscan extends React.Component {
    render() {
        const children = React.Children.toArray(this.props.children)
        if (!children.length > 0) {
            return ""
        }

        const childContent = children[0].toString()

        const type = this.props.type
        const linkText = this.props.text || childContent
        const address = this.props.address || childContent

        const etherscanUrl = Config.getEtherscanUrl()

        return <a target="_blank" rel="noopener" href={`${etherscanUrl}/${type}/${address}`}><TruncatedAddress>{linkText}</TruncatedAddress></a>
    }
}
