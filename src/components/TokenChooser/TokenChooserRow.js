import React from "react"
import Truncated from "../CustomComponents/Truncated"
import Round from "../CustomComponents/Round"
import Conditional from "../CustomComponents/Conditional"

export default class TokenChooserRow extends React.Component {
    onRowSelect = event => {
        this.props.onTokenSelect(this.props.token.name, this.props.token.address)
    }

    onRemove = event => {
        this.props.remove(this.props.token)
    }

    render() {
        const {token, isSelected} = this.props
        const selectedClass = isSelected ? "selected-row" : ""

        return (
            <tr className={"clickable " + selectedClass}>
                <td onClick={this.onRowSelect}><Truncated left="7" right="0">{token.name}</Truncated></td>
                <td onClick={this.onRowSelect}><Round>{token.baseVolume}</Round></td>
                <td onClick={this.onRowSelect}>
                    <Round percent suffix="%" fallback="-"
                           classNameFunc={(num) => num > 0 ? 'buy-green' : 'sell-red'}>{token.percentChange}</Round>
                </td>

                <Conditional displayCondition={this.props.editMode}>
                    <td onClick={this.onRemove}><span className="far fa-trash-alt"/></td>
                </Conditional>
            </tr>
        )
    }
}
