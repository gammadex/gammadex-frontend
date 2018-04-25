import React from "react"
import Truncated from "../CustomComponents/Truncated"
import Round from "../CustomComponents/Round"
import Conditional from "../CustomComponents/Conditional"

export default class TokenChooserRow extends React.Component {
    onClick = (tokenSymbol, tokenAddress) => {
        this.props.onTokenSelect(tokenSymbol, tokenAddress)
    }

    onRowSelect = event => {
        this.props.onTokenSelect(this.props.token.symbol, this.props.token.address)
    }

    onClick = event => {
        this.props.remove(this.props.token)
    }

    render() {
        const {token, isSelected} = this.props
        const selectedClass = isSelected ? "selected-row" : ""

        return (
            <tr className={"clickable " + selectedClass}>
                <Conditional displayCondition={this.props.editMode}>
                    <td><button className="btn-sm btn-primary" onClick={this.onClick}>X</button></td>
                </Conditional>
                <td onClick={this.onRowSelect}><Truncated left="7" right="0">{token.symbol}</Truncated></td>
                <td onClick={this.onRowSelect}><Round>{token.volume}</Round></td>
                <td onClick={this.onRowSelect}><Round>{token.percentChange}</Round></td>
            </tr>
        )
    }
}
