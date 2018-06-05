import React from "react"
import WebSocketStore from "../stores/WebSocketStore"
import AccountStore from "../stores/AccountStore"
import OpenOrdersStore from "../stores/OpenOrdersStore"
import Spinner from "./CustomComponents/Spinner"

export default class MarketResponseSpinner extends React.Component {
    constructor(props) {
        super()

        this.state = {
            isMarketResponseReceived: WebSocketStore.isMarketResponseReceived()
        }

        this.updateMarketResponseState = this.updateMarketResponseState.bind(this)
    }

    componentWillMount() {
        WebSocketStore.on("change", this.updateMarketResponseState)
    }

    componentWillUnmount() {
        WebSocketStore.removeListener("change", this.updateMarketResponseState)
    }

    updateMarketResponseState() {
        this.setState({
            isMarketResponseReceived: WebSocketStore.isMarketResponseReceived()
        })
    }

    render() {
        const {isMarketResponseReceived} = this.state

        return isMarketResponseReceived ? null : <Spinner/>
    }
}
