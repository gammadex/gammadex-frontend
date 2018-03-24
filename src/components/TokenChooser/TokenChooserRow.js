import React from "react"
import Truncated from "../CustomComponents/Truncated"

export default class TokenChooserRow extends React.Component {

    onTokenSelect = (tokenSymbol, tokenAddress) => {
        this.props.onTokenSelect(tokenSymbol, tokenAddress)
    }

    render() {
        const {token, isSelected} = this.props
        const selectedClass = isSelected ? "selected-row" : ""

        return (
            <tr onClick={() => this.onTokenSelect(token.symbol, token.address)}
                className={"clickable " + selectedClass}>

                <td><Truncated left="7" right="0">{token.symbol}</Truncated></td>
                <td>{token.volume}</td>
                <td>{token.percentChange}</td>
            </tr>
        )
    }
}
