import React from "react"

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

                <td>{token.symbol}</td>
                <td>{token.volume}</td>
                <td>{token.percentChange}</td>
            </tr>
        )
    }
}
