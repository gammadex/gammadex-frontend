import React from "react"
import Truncated from "../CustomComponents/Truncated"
import Round from "../CustomComponents/Round"
import Conditional from "../CustomComponents/Conditional"
import TruncatedAddress from "../CustomComponents/TruncatedAddress"
import Etherscan from "../CustomComponents/Etherscan"

export default class UnlistedTokenRow extends React.Component {
    onRowSelect = () => {
        this.props.onTokenSelect(this.props.token.name, this.props.token.address)
    }

    onRemove = () => {
        this.props.remove(this.props.token)
    }

    render() {
        const {token, isSelected} = this.props
        const selectedClass = isSelected ? "selected-row" : ""

        return (
            <tr className={"clickable " + selectedClass}>
                <td onClick={this.onRowSelect}><Truncated left="7" right="0">{token.name}</Truncated></td>
                <td onClick={this.onRowSelect}>{token.lName}</td>
                <td onClick={this.onRowSelect}>
                    <Etherscan type="address" address={token.address} display="truncate"/>
                </td>
                <td onClick={this.onRemove}><span className="far fa-trash-alt"/></td>
            </tr>
        )
    }
}
