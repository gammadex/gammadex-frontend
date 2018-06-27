import React from "react"
import Truncated from "../CustomComponents/Truncated"
import Round from "../CustomComponents/Round"
import Conditional from "../CustomComponents/Conditional"

export default class TokenChooserRow extends React.Component {
    onRowSelect = () => {
        this.props.onTokenSelect(this.props.token.symbol, this.props.token.address)
    }

    render() {
        const {token, isSelected} = this.props
        const selectedClass = isSelected ? "selected-row" : ""

        return (
            <tr className={"clickable " + selectedClass}>
                <td onClick={this.onRowSelect}><Truncated left="14" right="0">{token.symbol}</Truncated></td>
                <td onClick={this.onRowSelect}><Round fallback="-">{token.baseVolume}</Round></td>
                <td onClick={this.onRowSelect}>
                    <Round percent suffix="%" fallback="-"
                           classNameFunc={(num) => num > 0 ? 'buy-green' : 'sell-red'}>{token.percentChange}</Round>
                </td>
            </tr>
        )
    }
}
