import React from "react"

export default class EventMessage extends React.Component {
    render() {
        const { text } = this.props

        return (
            <tr>
                <td>{text}</td>
            </tr>
        )
    }
}
