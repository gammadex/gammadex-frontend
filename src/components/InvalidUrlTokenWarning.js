import React from "react"
import Conditional from "./CustomComponents/Conditional"
import TokenStore from "../stores/TokenStore"
import * as EthereumNetworks from "../util/EthereumNetworks"

export default class InvalidUrlTokenWarning extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            invalidTokenIdentifierInUrl: TokenStore.getInvalidTokenIdentifierInUrl(),
        }

        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
    }

    componentDidMount() {
        TokenStore.on("change", this.onTokenStoreChange)
    }

    componentWillUnmount() {
        TokenStore.removeListener("change", this.onTokenStoreChange)
      }

    onTokenStoreChange() {
        this.setState({
            invalidTokenIdentifierInUrl: TokenStore.getInvalidTokenIdentifierInUrl(),
        })
    }

    render() {
        const {invalidTokenIdentifierInUrl} = this.state

        return (
            <Conditional displayCondition={!!invalidTokenIdentifierInUrl}>
                <div className="alert alert-danger">
                    <strong>"{invalidTokenIdentifierInUrl}"</strong> is not recognised as a token address or symbol
                </div>
            </Conditional>
        )
    }
}