import React from "react"
import TokenChooserRow from "./TokenChooserRow"
import Conditional from "../CustomComponents/Conditional"

export default class TokenDisplay extends React.Component {
    render() {
        const tokenRows = this.props.tokenList.map(token => {
            return <TokenChooserRow
                key={token.address}
                editMode={this.props.editMode}
                token={token}
                isSelected={this.props.selectedToken && token.symbol === this.props.selectedToken.name}
                onTokenSelect={this.props.onTokenSelect}
                remove={this.props.removeToken}/>
        })

        return (
            <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover table-no-bottom-border">
                    <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Volume ETH</th>
                        <th>% Change</th>
                        <Conditional displayCondition={this.props.editMode}>
                            <th/>
                        </Conditional>
                    </tr>
                    </thead>
                    <tbody>{tokenRows}</tbody>
                </table>
            </div>
        )
    }
}