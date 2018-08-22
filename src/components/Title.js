import React from "react"

export default class Title extends React.Component {
    constructor(props) {
        super(props)
        this.componentWillMount = this.componentWillMount.bind(this)
        this.componentDidUpdate = this.componentDidUpdate.bind(this)
        this.updateTitleText = this.updateTitleText.bind(this)
    }

    componentWillMount() {
        this.updateTitleText()
    }

    componentDidUpdate() {
        this.updateTitleText()
    }

    updateTitleText() {
        const {token} = this.props

        const title = token ? `${token.symbol}/ETH | GammaDEX | Trade ${token.name}` : "GammaDEX"

        document.title = title
    }

    render() {
        return null
    }
}