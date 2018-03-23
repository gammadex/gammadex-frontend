import React from "react"
import {BoxSection} from "./Box"

export default class EmptyTableMessage extends React.Component {
    render() {
        return <BoxSection className="empty-message">
            {this.props.children}
        </BoxSection>
    }
}
