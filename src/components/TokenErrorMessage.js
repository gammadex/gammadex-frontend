import React from "react"
import Conditional from "./CustomComponents/Conditional"

export default class TokenErrorMessage extends React.Component {
    render() {
        const warning = this.props.warning
        
        return (
            <Conditional displayCondition={warning}>
                <div className="alert alert-warning">
                    <div>
                        <h3>{warning ? warning.title : ""}</h3>
                    </div>

                    {warning ? warning.message : ""}
                </div>
            </Conditional>
        )
    }
}