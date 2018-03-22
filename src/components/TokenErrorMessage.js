import React from "react"
import Conditional from "./CustomComponents/Conditional"

export default class TokenErrorMessage extends React.Component {
    render() {
        const invalidToken = this.props.invalidToken

        return (
            <Conditional displayCondition={invalidToken}>
                <div className="alert alert-warning">
                    <div>
                        <strong>No matching token</strong>
                    </div>

                    Sorry but the token '{invalidToken}' is not recognised as an address or symbol
                </div>
            </Conditional>
        )
    }
}