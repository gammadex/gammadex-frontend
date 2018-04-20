import React from "react"

export default class UnlockedSuccessAlert extends React.Component {
    render() {
        const {message} = this.props

        return <div>
            <div className="alert alert-success">
                {message}
            </div>
        </div>
    }
}